package core

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
	"github.com/kannachi323/homelib/protob"
	"google.golang.org/protobuf/proto"
)

type ClientRequest struct {
	ClientID string     `json:"client_id"`
	ChannelType string     `json:"channel_type"`
	ChannelName string `json:"channel_name"`
	Task    string `json:"task"`
	Body  json.RawMessage `json:"body"`
}

type Client struct {
	ID       string
	Conn     *websocket.Conn
	Device   *Device
	Incoming chan []byte
	Outgoing chan OutgoingMessage
	ChannelManager *ChannelManager
	Disconnected atomic.Bool
	closeOnce sync.Once
}


func NewClient(id string, conn *websocket.Conn, cm *ChannelManager) *Client {
	return &Client{
		ID:       id,
		Conn:     conn,
		Incoming: make(chan []byte, 256),
		Outgoing: make(chan OutgoingMessage, 256),
		ChannelManager: cm,
	}
}

func (c *Client) StartReader() {
	//reads messages from websocket connection and puts them into incoming channel
	go func() {
		defer c.ClientClose()
		for {
			msgType, msg, err := c.Conn.ReadMessage()
			if err != nil {
				log.Println("WebSocket read error:", err)
				return
			}
			switch (msgType) {
				case websocket.TextMessage:
					c.Incoming <- msg
				case websocket.BinaryMessage:
					log.Println("Received binary message, processing as protobuf")
					c.HandleProtobuf(msg)
			}			
		}
	}()
}

func (c *Client) StartProcessor() {
	//this goroutine processes messages from the Incoming channel
	go func() {
		for msg := range c.Incoming {
			c.HandleClient(msg)
		}
	}()
}

func (c *Client) StartWriter() {
	//this goroutine sends messages from the Outgoing channel to the WebSocket connection
	//channel broadcasts will put bytes into outgoing chan
	go func() {
		defer c.ClientClose()
		for msg := range c.Outgoing {
			if err := c.Conn.WriteMessage(msg.Type, msg.Payload); err != nil {
				log.Println("WebSocket write error:", err)
				return
			}
		}
	}()
}

func (c *Client) HandleClient(msg []byte) error {
	var req ClientRequest
	if err := json.Unmarshal(msg, &req); err != nil {
		log.Println("Invalid client request: ", err)
		return errors.New("invalid client request")
	}
	ch, err := c.ChannelManager.GetChannel(req.ChannelName)
	if err != nil {
		ch, err = c.ChannelManager.CreateChannel(req.ChannelName, "", req.ChannelType)
		if err != nil {
			return err
		}
	}
	if ch.Handler == nil {
		return errors.New("no handler for channel")
	}
	ch.Handler.HandleChannel(c, &req, ch)
	return nil
}

func (c *Client) HandleProtobuf(msg []byte) error {
	var blob protob.Blob
	if err := proto.Unmarshal(msg, &blob); err != nil {
		log.Println("failed to unmarshal blob:", err)
		return errors.New("failed to unmarshal blob")
	}

	//after we get a blob, first get the channel it belongs to
	channel, err := c.ChannelManager.GetChannel(blob.GetChannelName())
	if err != nil {
		log.Printf("failed to get channel %s: %v\n", blob.GetChannelName(), err)
		return errors.New("failed to get channel")
	}

	sessionKey := fmt.Sprintf("%s->%s", blob.Src, blob.Dst)
	pool, ok := channel.Handler.(*TransferHandler).GetSession(sessionKey)
	if !ok {
		log.Printf("no active transfer session found for %s\n", sessionKey)
		return errors.New("no active transfer session found")
	}
	
	log.Println("Dispatching blob to worker pool for processing")
	pool.Dispatch(&blob)
	return nil
}

func (c *Client) ClientClose() {
	c.closeOnce.Do(func() {
		close(c.Outgoing)
		close(c.Incoming)
		c.Disconnected.Store(true)
		c.Conn.Close()
	})
}

// ClientManager handles a collection of connected clients.
type ClientManager struct {
	Clients        map[string]*Client
	mu             sync.RWMutex
}

func NewClientManager() *ClientManager {
	return &ClientManager{
		Clients:        make(map[string]*Client),
	}
}

func (cm *ClientManager) ClientAdd(client *Client) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	cm.Clients[client.ID] = client
}

func (cm *ClientManager) ClientRemove(clientID string) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	delete(cm.Clients, clientID)
}

func (cm *ClientManager) ClientJoinChannel(clientID, channelName string) error {
	cm.mu.RLock()
	client, exists := cm.Clients[clientID]
	cm.mu.RUnlock()
	if !exists {
		return errors.New("client does not exist")
	}

	client.ChannelManager.ChannelAddClient(client, channelName)
	return nil
}

func (cm *ClientManager) GetClient(clientID string) (*Client, error) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	client, exists := cm.Clients[clientID]
	if !exists {
		return nil, errors.New("client not found")
	}
	return client, nil
}





