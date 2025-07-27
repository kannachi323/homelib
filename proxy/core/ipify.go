package core

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type IpifyHandler struct {}

type IpifyReqBody struct {}

type IpifyResult struct {
	IP string `json:"ip"`
}

func (ic *IpifyHandler) HandleChannel(client *Client, req *ClientRequest, ch *Channel) {
	switch (req.Task) {
	case "join":
		ic.JoinIpify(client, req, ch)
	case "get_ip":
		ic.GetLocalIP(client, req, ch)
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

func (ic *IpifyHandler) BroadcastToClient(res *ChannelResponse, ch *Channel, client *Client) error {
	b, err := json.Marshal(res)
	if err != nil {
		return err
	}

	ch.Mu.RLock()
	defer ch.Mu.RUnlock()
	select {
	case client.Outgoing <- b:
	default:
		log.Println("Client channel full:", client.ID)
	}

	return nil
}

func (ic *IpifyHandler) Broadcast(res *ChannelResponse, ch *Channel) error {
	b, err := json.Marshal(res)
	if err != nil {
		return err
	}

	ch.Mu.RLock()
	defer ch.Mu.RUnlock()
	log.Println("Broadcasting to channel:", ch.Name, "with", len(ch.Clients), "clients")
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

// these are all the possible tasks for the ipify channel
func (ic *IpifyHandler) JoinIpify(client *Client, req *ClientRequest, ch *Channel) {

	// client already joined the channel
	if err := ch.AddToChannel(client); err != nil {
		log.Println("Error adding client to channel:", err)
		res := ic.CreateChannelResponse(
			req.ClientID,
			req.ChannelName,
			req.Task,
			false,
			nil,
			err.Error(),
		)
		if err := ic.Broadcast(res, ch); err != nil {
			log.Println("Error broadcasting join response:", err)
		}
		return
	}

	// let client join the chnnel
	res := ic.CreateChannelResponse(
		req.ClientID,
		req.ChannelName,
		req.Task,
		true,
		nil,
		"",
	)

	if err := ic.Broadcast(res, ch); err != nil {
		log.Println("Error broadcasting join response:", err)
	}
}


func (ic *IpifyHandler) GetLocalIP(client *Client, req *ClientRequest, ch *Channel) {
	// client must first join the ipify channel
	if !ch.ClientExists(client.ID) {
		//let the client know they are not in the channel
		ic.BroadcastToClient(&ChannelResponse{
			ClientID: client.ID,
			Channel:  req.ChannelName,
			Task:     req.Task,
			Success:  false,
			Result:   nil,
			Error:    "client not in ipify channel",
		}, ch, client)
		log.Println("Client not in ipify channel:", client.ID)
		return
	}

	resp, err := http.Get("https://api.ipify.org?format=json")
	if err != nil {
		log.Println("Error fetching IP from ipify.org:", err)
		return
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading ipify response:", err)
		return
	}

	var result IpifyResult
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		log.Println("Error parsing ipify response:", err)
		return
	}

	res := ic.CreateChannelResponse(
		client.ID,
		req.ChannelName,
		req.Task,
		true,
		result,
		"",
	)

	if err := ic.Broadcast(res, ch); err != nil {
		log.Println("Error broadcasting IP response:", err)
	}
}

