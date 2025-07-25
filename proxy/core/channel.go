package core

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
)

type Channel struct {
	Name string `json:"name"`
	Info string `json:"info"`
	Clients map[string]*Client
	mu sync.RWMutex
	Quit chan struct{}
	closeOnce sync.Once
}

func NewChannel(name, info string) *Channel {
	return &Channel{
		Name: name,
		Info: info,
		Clients: make(map[string]*Client),
	}
}


func (ch *Channel) Broadcast(res *ServerResponse) error {
	b, err := json.Marshal(res)
	if err != nil {
		return err
	}

	send := func(c *Client) error {
		if c.Disconnected.Load() {
			return nil
		}
		select {
		case c.Outgoing <- b:
			return nil
		default: 
			return errors.New("client channel full")
		}
	}

	// send to all clients subscribe to this channel in server response
	ch.mu.RLock()
	defer ch.mu.RUnlock()
	for _, client := range ch.Clients {
		if err := send(client); err != nil {
			log.Println("Error sending message to client:", client.ID, err)
		}
	}
	return nil
}

func (ch *Channel) AddToChannel(client *Client) {
	ch.mu.Lock()
	defer ch.mu.Unlock()
	ch.Clients[client.ID] = client
}

func (ch *Channel) RemoveFromChannel(clientID string) {
	ch.mu.Lock()
	defer ch.mu.Unlock()
	delete(ch.Clients, clientID)
}