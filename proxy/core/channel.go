package core

import (
	"errors"
	"log"
	"sync"
)


type ChannelManager struct {
	Channels map[string]*Channel
	mu       sync.RWMutex
}

func NewChannelManager() *ChannelManager {
	return &ChannelManager{
		Channels: map[string]*Channel{
			"system": NewChannel("system", "proxy:system", &SystemHandler{}),
			"ipify":  NewChannel("ipify", "proxy:ipify", &IpifyHandler{}),
		},
	}
}

// --- ChannelManager methods ---
func (cm *ChannelManager) ChannelAddClient(client *Client, channelName string) error {
	cm.mu.RLock()
	channel, exists := cm.Channels[channelName]
	cm.mu.RUnlock()
	if !exists {
		log.Println("Channel does not exist:", channelName)
		return errors.New("channel does not exist")
	}

	channel.AddToChannel(client)

	return nil
}

func (cm *ChannelManager) ChannelRemoveClient(client *Client, channelName string) error {
	cm.mu.RLock()
	channel, exists := cm.Channels[channelName]
	cm.mu.RUnlock()
	if !exists {
		log.Println("Channel does not exist:", channelName)
		return errors.New("channel does not exist")
	}

	channel.RemoveFromChannel(client.ID)
	return nil
}

func (cm *ChannelManager) ChannelRemoveAllClients(clientID string) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	for _, ch := range cm.Channels {
		ch.RemoveFromChannel(clientID)
	}
}

func (cm *ChannelManager) GetChannel(name string) (*Channel, error) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	channel, exists := cm.Channels[name]
	if !exists {
		return nil, errors.New("channel not found")
	}
	return channel, nil
}

// --- Channel methods ---

type Channel struct {
	Name    string            `json:"name"`
	Info    string            `json:"info"`
	Clients map[string]*Client
	Handler ChannelHandler
	Mu      sync.RWMutex
}

func NewChannel(name, info string, handler ChannelHandler) *Channel {
	return &Channel{
		Name:    name,
		Info:    info,
		Clients: make(map[string]*Client),
		Handler: handler,
	}
}

func (ch *Channel) AddToChannel(client *Client) error {
	ch.Mu.Lock()
	defer ch.Mu.Unlock()

	if _, exists := ch.Clients[client.ID]; exists {
		log.Println("client ", client.ID, "already in channel", ch.Name)
		return errors.New("client already in channel")
	}

	ch.Clients[client.ID] = client
	return nil
}


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


// --- ChannelHandler interface ---
type ChannelHandler interface {
	HandleChannel(client *Client, req *ClientRequest, ch *Channel)	
	CreateChannelResponse(clientID, channel, task string, success bool, result interface{}, errMsg string) *ChannelResponse
	Broadcast(res *ChannelResponse, ch *Channel) error
}

type ChannelResponse struct {
	ClientID string `json:"client_id"`
	Channel string `json:"channel"`
	Task string `json:"task"`
	Success bool  `json:"success"`
	Result interface{} `json:"result"`
	Error string `json:"error,omitempty"`
}



