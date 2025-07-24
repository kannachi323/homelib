package core

import (
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Conn	*websocket.Conn
	Send 	chan []byte
	Channels map[string]bool
}

func NewClient(id, name string, conn *websocket.Conn) *Client {
	return &Client{
		ID: id,
		Name: name,
		Conn: conn,
		Send: make(chan []byte, 256),
		Channels: make(map[string]bool),
	}
}

func (c *Client) SendMessage(message []byte) {
	select {
	case c.Send <- message:
	default:
		log.Printf("Client %s send buffer full. Dropping message or disconnecting.\n", c.ID)
	}
}

func (c *Client) WriteData() {
	defer func() {
		c.Conn.Close()
	}()

	for msg := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Println("WebSocket write error:", err)
			return
		}
	}

	c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
}

