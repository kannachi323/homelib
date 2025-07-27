package core

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
)

type ClientRequest struct {
	ClientID string     `json:"client_id"`
	ChannelType string     `json:"channel_type"`
	ChannelName string `json:"channel_name"`
	Task    string `json:"task"`
}

type Client struct {
	ID       string
	Conn     *websocket.Conn
	Incoming chan []byte
	Outgoing chan []byte
	ChannelManager *ChannelManager
	Disconnected atomic.Bool
	closeOnce sync.Once
}


func NewClient(id string, conn *websocket.Conn, cm *ChannelManager) *Client {
	return &Client{
		ID:       id,
		Conn:     conn,
		Incoming: make(chan []byte, 256),
		Outgoing: make(chan []byte, 256),
		ChannelManager: cm,
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
			var clientRequest ClientRequest
			err := json.Unmarshal(msg, &clientRequest)
			if err != nil {
				log.Println("Error unmarshalling client request:", err)
				continue
			}
			log.Println("Processing client request:", clientRequest)
			c.HandleClient(c, &clientRequest)
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

func (c *Client) HandleClient(client *Client, req *ClientRequest) error {
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
	ch.Handler.HandleChannel(client, req, ch)
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



