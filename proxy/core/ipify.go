package core

import (
	"encoding/json"
	"log"
)

type IpifyHandler struct {}

type IpifyReqBody struct {}

type IpifyResult struct {
	IP string `json:"ip"`
}

func (ic *IpifyHandler) HandleChannel(req *ClientRequest, ch *Channel) {
	log.Println(req);
	
	// Example: simulate IP response
	res := ic.CreateChannelResponse(
		req.ClientID,
		req.Channel, 
		req.Task,
		true,
		&IpifyResult{IP: "0.0.0.0"},
		"",
	)

	// Broadcast to all connected clients
	if err := ic.Broadcast(res, ch); err != nil {
		log.Println("Error broadcasting:", err)
	}
}

func (ic *IpifyHandler) CreateChannelResponse(clientID, channel, task string, success bool, result interface{}, errMsg string) *ChannelResponse {
	return &ChannelResponse{
		ClientID: clientID,
		Channel:  channel,
		Task:     task,
		Success:  success,
		Result:   result,
		Error:    errMsg,
	}
}

func (ic *IpifyHandler) Broadcast(res *ChannelResponse, ch *Channel) error {
	b, err := json.Marshal(res)
	if err != nil {
		return err
	}

	ch.Mu.RLock()
	defer ch.Mu.RUnlock()
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
