package api

import (
	"encoding/json"
	"log"
	"net/http"
	"proxy/core"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func CreateConn(cm *core.ClientManager, chm *core.ChannelManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		log.Println("WebSocket connection established")

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
		client := core.NewClient(clientID, conn, chm)

		cm.ClientAdd(client)

		if err := cm.ClientJoinChannel(clientID, "system"); err != nil {
			log.Println("Client failed to join channel:", err)
			conn.Close()
			return
		}
		

		client.StartReader()
		client.StartProcessor()
		client.StartWriter()


	}
}
