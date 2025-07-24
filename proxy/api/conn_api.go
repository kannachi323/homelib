package api

import (
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

func CreateConn(cm *manager.ChannelManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Upgrade HTTP to WebSocket
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		defer conn.Close()

		clientID := uuid.NewString()
		client := core.NewClient(clientID, "anonymous", conn)
		log.Printf("New client connected: %s", clientID)

		cm.AddClientToChannel(client, "system")

		
		go client.WriteData()
	}
}