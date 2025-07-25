package manager

import (
	"errors"
	"proxy/core"
	"sync"
)


type ClientManager struct {
	Clients map[string]*core.Client	
	mu sync.RWMutex
	ChannelManager *ChannelManager
}

func NewClientManager(cm *ChannelManager) *ClientManager {
	return &ClientManager{
		Clients: make(map[string]*core.Client),
		ChannelManager: cm,
	}
}

func (cm *ClientManager) AddChannelToClient(clientID, channelName string) error {
	cm.mu.Lock()
	client, exists := cm.Clients[clientID]
	if !exists {
		return errors.New("client does not exist")
	}
	defer cm.mu.Unlock()
	

	_, err := cm.ChannelManager.GetChannel(channelName)
	if err != nil {
		return errors.New("channel does not exist")
	}

	cm.ChannelManager.AddClientToChannel(client, channelName)

	cm.mu.Lock()
	defer cm.mu.Unlock()
	client.Channels[channelName] = true

	return nil
}