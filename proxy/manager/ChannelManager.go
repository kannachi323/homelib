package manager

import (
	"errors"
	"log"
	"proxy/core"
	"sync"
)

type ChannelManager struct {
	Channels map[string]*core.Channel
	mu sync.RWMutex
}


func NewChannelManager() *ChannelManager {
	channels := map[string]*core.Channel{
		"system": core.NewChannel("system", "proxy:system"),
		"ipify":  core.NewChannel("ipify", "proxy:ipify"),
	}

	return &ChannelManager{
		Channels: channels,
	}
}


func (cm *ChannelManager) AddClientToChannel(client *core.Client, channelName string) error {
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

func (cm *ChannelManager) RemoveClientFromChannel(client *core.Client, channelName string) error {
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

func (cm *ChannelManager) GetChannel(name string) (*core.Channel, error) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()

	channel, exists := cm.Channels[name]
	if !exists {
		return nil, errors.New("channel not found")
	}
	return channel, nil
}


