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
			"system": NewChannel("system", "proxy:system"),
			"ipify":  NewChannel("ipify", "proxy:ipify"),
		},
	}
}



// --- ChannelManager methods ---

func (cm *ChannelManager) AddToChannel(client *Client, channelName string) error {
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

func (cm *ChannelManager) RemoveClientFromChannel(client *Client, channelName string) error {
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

func (cm *ChannelManager) RemoveClientFromAllChannels(clientID string) {
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
	mu      sync.RWMutex
}

func NewChannel(name, info string) *Channel {
	return &Channel{
		Name:    name,
		Info:    info,
		Clients: make(map[string]*Client),
	}
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


// --- ChannelHandler interface ---
type ChannelHandler interface {
	HandleChannel(task string)	
	CreateChannelResponse(clientID, channel, task string, success bool, result interface{}, errMsg string) *ChannelResponse
	Broadcast(res *ChannelResponse) error
}

type ChannelResponse struct {
	ClientID string `json:"client_id"`
	Channel string `json:"channel"`
	Task string `json:"task"`
	Success bool  `json:"success"`
	Result interface{} `json:"result"`
	Error string `json:"error,omitempty"`
}

