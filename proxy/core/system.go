package core

import (
	"encoding/json"
	"log"
)

type SystemHandler struct {}

type SystemReqBody struct {
	Timestamp string `json:"timestamp"`
}

type SystemResult struct {
	Message string `json:"message"`
}

func (s *SystemHandler) HandleChannel(client *Client, req *ClientRequest, ch *Channel) {
	//we can get info from the client request body, it shoudl be of type SystemBody

	switch (req.Task) {
	case "join":
		s.JoinSystem(client, req, ch)
	}
}

func (s *SystemHandler) CreateChannelResponse(clientID, channel, task string, success bool, result interface{}, errMsg string) *ChannelResponse {
	return &ChannelResponse{
		ClientID: clientID,
		Channel:  channel,
		Task:     task,
		Success:  success,
		Result:   result,
		Error:    errMsg,
	}
}

func (s *SystemHandler) Broadcast(res *ChannelResponse, ch *Channel) error {
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

func (s *SystemHandler) JoinSystem(client *Client, req *ClientRequest, ch *Channel) {
	if err := ch.AddToChannel(client); err != nil {
		log.Println("Error adding client to channel:", err)
		return
	}

	res := s.CreateChannelResponse(
		req.ClientID,
		req.ChannelName,
		req.Task,
		true,
		SystemResult{Message: "Joined system channel"},
		"",
	)

	if err := ch.SendToClient(res, client); err != nil {
		log.Println("Error broadcasting join message:", err)
	}
}