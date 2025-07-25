package core

import (
	"log"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Conn	*websocket.Conn `json:"-"`
	Incoming chan []byte `json:"-"`
	Outgoing chan []byte `json:"-"`
	Channels map[string]bool `json:"-"`
	Disconnected atomic.Bool `json:"-"`
	closeOnce sync.Once `json:"-"`
}

func NewClient(id, name string, conn *websocket.Conn) *Client {
	return &Client{
		ID: id,
		Name: name,
		Conn: conn,
		Incoming: make(chan []byte, 256),
		Outgoing: make(chan []byte, 256),
		Channels: make(map[string]bool),
	}
}

func (c *Client) StartReader() {
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

func (c *Client) StartWriter() {
	go func() {
		defer c.ClientClose()
		for msg := range c.Outgoing {
			err := c.Conn.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
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
		c.Conn.Close()
	})
}
