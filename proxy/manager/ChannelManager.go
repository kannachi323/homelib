package manager

import (
	"proxy/core"
)

type ChannelManager struct {
	Channels map[string]*core.Channel
}


func CreateChannelManager() *ChannelManager {
	channels := map[string]*core.Channel{
		"system": core.NewChannel("system", "proxy:system", []string{}),
		"ipify":  core.NewChannel("ipify", "proxy:ipify", []string{}),
	}

	return &ChannelManager{
		Channels: channels,
	}
}


func (cm *ChannelManager) AddClientToChannel(client *core.Client, channelName string) {
	if channel, exists := cm.Channels[channelName]; exists {
		channel.Clients[client.ID] = client
		client.Channels[channelName] = true
	}
}

