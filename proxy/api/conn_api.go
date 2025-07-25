package api

import (
	"encoding/json"
	"log"
	"net/http"
	"proxy/core"
	"proxy/manager"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader {
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func CreateConn(cm *manager.ClientManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Upgrade HTTP to WebSocket
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}

		var data core.ClientRequest
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		log.Println(data)
		
		clientID := uuid.NewString()
		client := core.NewClient(clientID, "anonymous", conn)
		log.Printf("New client connected: %s", clientID)

		cm.AddChannelToClient(clientID, "system")
		cm.ChannelManager.AddClientToChannel(client, "system")
		
		client.StartReader()
		client.StartWriter()

		channel, err := cm.ChannelManager.GetChannel("as")
		if err != nil {
			log.Printf("Error getting channel: %v", err)
			return
		}

		res := &core.ServerResponse{
			Channel: "adf",
			Message: "You are now connected",
		}
		channel.Broadcast(res)
	}
}