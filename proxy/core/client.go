package core

import (
	"errors"
	"log"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID       string
	Conn     *websocket.Conn
	Incoming chan []byte
	Outgoing chan []byte
	Channels map[string]bool
	Disconnected atomic.Bool
	closeOnce sync.Once
}

func NewClient(id string, conn *websocket.Conn) *Client {
	return &Client{
		ID:       id,
		Conn:     conn,
		Incoming: make(chan []byte, 256),
		Outgoing: make(chan []byte, 256),
		Channels: make(map[string]bool),
	}
}

func (c *Client) StartReader() {
	//reads messages from websocket connection and puts them into incoming channel
	go func() {
		defer c.ClientClose()
		for {
			_, msg, err := c.Conn.ReadMessage()
			if err != nil {
				log.Println("WebSocket read error:", err)
				return
			}
			c.Incoming <- msg
		}
	}()
}

func (c *Client) StartProcessor() {
	//this goroutine processes messages from the Incoming channel
	go func() {
		for msg := range c.Incoming {
			log.Printf("[Processor] Message from %s: %s", c.ID, string(msg))
			// Optionally unmarshal and route the command
		}
	}()
}

func (c *Client) StartWriter() {
	//this goroutine sends messages from the Outgoing channel to the WebSocket connection
	//channel broadcasts will put bytes into outgoing chan
	go func() {
		defer c.ClientClose()
		for msg := range c.Outgoing {
			if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Println("WebSocket write error:", err)
				return
			}
		}
	}()
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
	ChannelManager *ChannelManager
}

func NewClientManager(cm *ChannelManager) *ClientManager {
	return &ClientManager{
		Clients:        make(map[string]*Client),
		ChannelManager: cm,
	}
}

func (cm *ClientManager) AddClient(client *Client) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	cm.Clients[client.ID] = client
}

func (cm *ClientManager) RemoveClient(clientID string) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	delete(cm.Clients, clientID)
}

func (cm *ClientManager) JoinChannel(clientID, channelName string) error {
	cm.mu.RLock()
	client, exists := cm.Clients[clientID]
	cm.mu.RUnlock()
	if !exists {
		return errors.New("client does not exist")
	}

	_, err := cm.ChannelManager.GetChannel(channelName)
	if err != nil {
		return errors.New("channel does not exist")
	}

	cm.ChannelManager.AddToChannel(client, channelName)
	client.Channels[channelName] = true
	return nil
}
