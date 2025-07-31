package core

import (
	"encoding/json"
	"errors"
	"log"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/kannachi323/homelib/protob"
	"google.golang.org/protobuf/proto"
)

// ChannelManager manages multiple channels.
type ChannelManager struct {
	Channels map[string]*Channel
	mu       sync.RWMutex
}

func NewChannelManager() *ChannelManager {
	handler := NewTransferHandler()
	transferChannel, err := NewChannel("proxy:system", "server to send out notifications", handler)
	if err != nil {
		log.Println("Error creating system channel:", err)
		return nil
	}

	return &ChannelManager{
		Channels: map[string]*Channel{
			"system": transferChannel,
		},
	}
}

func (cm *ChannelManager) CreateChannel(name, info, channelType string) (*Channel, error) {
	cm.mu.Lock()
	defer cm.mu.Unlock()

	if ch, exists := cm.Channels[name]; exists {
		return ch, errors.New("channel already exists")
	}

	var handler ChannelHandler
	switch channelType {
	case "transfer":
		handler = NewTransferHandler()
	default:
		return nil, errors.New("unknown channel type")
	}

	ch, err := NewChannel(name, info, handler)
	if err != nil {
		return nil, err
	}

	cm.Channels[name] = ch
	return ch, nil
}

// ChannelAddClient adds a client to a channel, creating the channel if it doesn't exist.
func (cm *ChannelManager) ChannelAddClient(client *Client, channelName string) error {
	cm.mu.RLock()
	channel, exists := cm.Channels[channelName]
	cm.mu.RUnlock()

	if !exists {
		return errors.New("channel does not exist")
	}

	if err := channel.AddToChannel(client); err != nil {
		log.Println("Error adding client to channel:", err)
		return err
	}

	return nil
}

// ChannelRemoveClient removes a client from the given channel.
func (cm *ChannelManager) ChannelRemoveClient(client *Client, channelName string) error {
	cm.mu.RLock()
	channel, exists := cm.Channels[channelName]
	cm.mu.RUnlock()
	if !exists {
		log.Println("Channel does not exist:", channelName)
		return errors.New("channel does not exist")
	}

	return channel.RemoveFromChannel(client.ID)
}

// ChannelRemoveAllClients removes a client from all channels.
func (cm *ChannelManager) ChannelRemoveAllClients(clientID string) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	for _, ch := range cm.Channels {
		_ = ch.RemoveFromChannel(clientID)
	}
}

// GetChannel returns a channel by name.
func (cm *ChannelManager) GetChannel(name string) (*Channel, error) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	channel, exists := cm.Channels[name]
	if !exists {
		return nil, errors.New("channel not found")
	}
	return channel, nil
}

// Channel represents a group of clients.
type Channel struct {
	Name    string            `json:"name"`
	Info    string            `json:"info"`
	Clients map[string]*Client
	Handler ChannelHandler
	Mu      sync.RWMutex
}

// NewChannel creates a new Channel instance.
func NewChannel(name, info string, handler ChannelHandler) (*Channel, error) {
	return &Channel{
		Name:    name,
		Info:    info,
		Clients: make(map[string]*Client),
		Handler: handler,
	}, nil
}

// AddToChannel adds a client to the channel if not already present.
func (ch *Channel) AddToChannel(client *Client) error {
	ch.Mu.Lock()
	defer ch.Mu.Unlock()

	if _, exists := ch.Clients[client.ID]; exists {
		return errors.New("client already in channel")
	}

	ch.Clients[client.ID] = client
	return nil
}

// RemoveFromChannel removes a client from the channel if present.
func (ch *Channel) RemoveFromChannel(clientID string) error {
	ch.Mu.Lock()
	defer ch.Mu.Unlock()

	if _, exists := ch.Clients[clientID]; !exists {
		log.Println("client", clientID, "not found in channel", ch.Name)
		return errors.New("client not found in channel")
	}

	delete(ch.Clients, clientID)
	return nil
}
func (ch *Channel) SendToClient(res interface{}, client *Client) error {
	var (
		payload []byte
		msgType int
		err     error
	)

	switch v := res.(type) {
	case *ChannelResponse:
		payload, err  = json.Marshal(v)
		msgType = websocket.TextMessage
	case *protob.Blob:
		log.Println("Sending Blob to client:", client.ID, "on channel:", ch.Name)
		payload, err = proto.Marshal(v)
		msgType = websocket.BinaryMessage
	default:
		log.Println("unsupported message type:", v)
		return errors.New("unsupported message type")
	}

	if err != nil {
		return err
	}

	ch.Mu.RLock()
	defer ch.Mu.RUnlock()

	select {
	case client.Outgoing <- OutgoingMessage{Type: msgType, Payload: payload}: // Send the new struct
		log.Printf("Sent message to client %s on channel %s", client.ID, ch.Name)
	default:
		log.Println("Client channel full:", client.ID)
	}

	return nil
}

// Also update ch.Broadcast
func (ch *Channel) Broadcast(res *ChannelResponse) error {
	b, err := json.Marshal(res)
	if err != nil {
		return err
	}

	ch.Mu.RLock()
	defer ch.Mu.RUnlock()
	log.Println("Broadcasting to channel:", ch.Name, "with", len(ch.Clients), "clients")
	for _, client := range ch.Clients {
		if client.Disconnected.Load() {
			continue
		}
		select {
		case client.Outgoing <- OutgoingMessage{Type: websocket.TextMessage, Payload: b}: // Send as TextMessage
		default:
			log.Println("Client channel full:", client.ID)
		}
	}
	return nil
}

func (ch *Channel) GetClient(clientID string) (*Client, error) {
	ch.Mu.RLock()
	defer ch.Mu.RUnlock()

	client, exists := ch.Clients[clientID]
	if !exists {
		return nil, errors.New("client not found in channel")
	}
	return client, nil
}

// ClientExists returns true if the client is in the channel.
func (ch *Channel) ClientExists(clientID string) bool {
	ch.Mu.RLock()
	defer ch.Mu.RUnlock()

	_, exists := ch.Clients[clientID]
	return exists
}

// ChannelHandler defines the interface for handling channel tasks.
type ChannelHandler interface {
	HandleChannel(client *Client, req *ClientRequest, ch *Channel)
	CreateChannelResponse(clientID, channel, task string, success bool, errMsg string) *ChannelResponse
}

// ChannelResponse represents a response to send on a channel.
type ChannelResponse struct {
	ClientID string      `json:"client_id"`
	Channel  string      `json:"channel"`
	Task     string      `json:"task"`
	Success  bool        `json:"success"`
	Error    string      `json:"error,omitempty"`
}

type OutgoingMessage struct {
	Type int     `json:"type"`
	Payload []byte    `json:"data"`
}
