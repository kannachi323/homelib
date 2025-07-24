package core

import "log"

type Channel struct {
	Name string `json:"name"`
	Info string `json:"info"`
	Clients map[string]*Client
}

func NewChannel(name, info string, messages []string) *Channel {
	return &Channel{
		Name: name,
		Info: info,
		Clients: make(map[string]*Client),
	}
}

func (ch *Channel) Broadcast(message string) {

	for _, client := range ch.Clients {
		select {
		case client.Send <- []byte(message):
		default:
			// Optional: remove unresponsive client
			close(client.Send)
			delete(ch.Clients, client.ID)
			client.Conn.Close()
			log.Printf("Removed unresponsive client %s from channel %s\n", client.ID, ch.Name)
		}
	}
}


func (ch *Channel) AddClient(client *Client) {
	ch.Clients[client.ID] = client
}

func (ch *Channel) RemoveClient(clientID string) {
	delete(ch.Clients, clientID)
}
