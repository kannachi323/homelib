package channel

import (
	"encoding/json"
	"log"
	"proxy/core"
)

type IpifyChannel struct {
}

func (ic *IpifyChannel) HandleChannel(task string, ch *core.Channel) {
	// handle Ipify-specific tasks
}

func (ic *IpifyChannel) CreateChannelResponse(clientID, channel, task string, success bool, result interface{}, errMsg string) *core.ChannelResponse {
	return &core.ChannelResponse{
		ClientID: clientID,
		Channel:  channel,
		Task:     task,
		Success:  success,
		Result:   result,
		Error:    errMsg,
	}
}

func (ch *Channel) Broadcast(res *ChannelResponse) error {
	b, err := json.Marshal(res)
	if err != nil {
		return err
	}

	ch.mu.RLock()
	defer ch.mu.RUnlock()
	for _, client := range ch.Clients {
		if client.Disconnected.Load() {
			continue
		}
		select {
		case client.Outgoing <- b:
		default:
			log.Println("Client channel full:", client.ID)
		}
	}
	return nil
}
