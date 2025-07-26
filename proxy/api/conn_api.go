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
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		log.Println("WebSocket connection established")

		// Wait for initial message
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading initial message:", err)
			conn.Close()
			return
		}

		var data core.ClientRequest
		if err := json.Unmarshal(msg, &data); err != nil {
			log.Println("Invalid initial JSON:", err)
			conn.Close()
			return
		}
	
		clientID := uuid.NewString()
		client := core.NewClient(clientID, "anonymous", conn)

		cm.AddChannelToClient(clientID, "system")
		cm.ChannelManager.AddClientToChannel(client, "system")

		client.StartReader()
		client.StartWriter()

		if channel, err := cm.ChannelManager.GetChannel("system"); err == nil {
			channel.Broadcast(&core.ServerResponse{
				Channel: "system",
				Message: "You are now connected",
			})
		}
	}
}
