package api

import (
	"log"
	"net/http"

	"github.com/kannachi323/homelib/core"

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

		// TODO: need to feed onopen message without blocking main thread and add users to system channel

		client := core.NewClient("88d0cd1e-912c-4d7f-9bc8-f9ef324d3df9", conn, chm)
		cm.ClientAdd(client)

		// Let the reader handle the first message asynchronously
		client.StartReader()
		client.StartProcessor()
		client.StartWriter()
	}
}

