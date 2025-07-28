package core

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
	"github.com/kannachi323/homelib/proxy/protob"
	"google.golang.org/protobuf/proto"
)

type ClientRequest struct {
	ClientID string     `json:"client_id"`
	ChannelType string     `json:"channel_type"`
	ChannelName string `json:"channel_name"`
	Task    string `json:"task"`
	Data  []byte `json:"data"`
}

type BlobRequest struct {
	ClientID    string `json:"client_id"`
	ChannelType string `json:"channel_type"`
	ChannelName string `json:"channel_name"`
	Task        string `json:"task"`
	FileName    string `json:"file_name"`
	ChunkIndex  int    `json:"chunk_index"`
	TotalChunks int    `json:"total_chunks"`
}


type Client struct {
	ID       string
	Conn     *websocket.Conn
	Device   *Device
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
			msgType, msg, err := c.Conn.ReadMessage()
			if err != nil {
				log.Println("WebSocket read error:", err)
				return
			}
			switch (msgType) {
				case websocket.TextMessage:
					c.Incoming <- msg
				case websocket.BinaryMessage:
					//my protocol buffers
					c.HandleProtobuf(c, msg)
			}			
		}
	}()
}

func (c *Client) StartProcessor() {
	//this goroutine processes messages from the Incoming channel
	go func() {
		for msg := range c.Incoming {
			c.HandleClient(c, msg)
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

func (c *Client) HandleClient(client *Client, msg []byte) error {
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
	ch.Handler.HandleChannel(client, req, ch)
	return nil
}

func (c *Client) HandleProtobuf(client *Client, msg []byte) error {
	var blob protob.Blob
	if proto.Unmarshal(msg, &blob) != nil {
		log.Println("Error unmarshalling protobuf message")
		return errors.New("failed to unmarshal protobuf message")
	}

	ch, err := c.ChannelManager.GetChannel(blob.GetChannelName())
	if err != nil {
		ch, err = c.ChannelManager.CreateChannel(blob.GetChannelName(), "", "blob")
		if err != nil {
			log.Println("Error creating channel:", err)
			return err	
		}
	}

	if ch.Handler == nil {
		log.Println("No handler for channel:", blob.GetChannelName())
		return errors.New("no handler for channel")
	}
	ch.Handler.HandleChannel(client, &blob, ch)
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





