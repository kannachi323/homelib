package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

func PubToChannel() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    ctx := context.Background()
    rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})


    go func() {
      channel := "proxy:events"
      for i := 1; i <= 5; i++ {
        msg := fmt.Sprintf("News %d", i)
        if err := rdb.Publish(ctx, channel, msg).Err(); err != nil {
          log.Println("Publish error:", err)
        }
        time.Sleep(2 * time.Second)
      }
    }()

    w.Write([]byte("Publishing started\n"))
  }
}

func SubToChannel() http.HandlerFunc {
  	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
			if err != nil {
				log.Println("WebSocket upgrade error:", err)
				return
			}
			defer conn.Close()

		ctx := context.Background()
		rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})

		pubsub := rdb.Subscribe(ctx, "proxy:events")
		defer pubsub.Close()

		ch := pubsub.Channel()

		for {
			select {
			case msg := <-ch:
				err := conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload))
				if err != nil {
					log.Println("WebSocket write error:", err)
					return
				}
			case <-r.Context().Done():
				log.Println("Client connection closed")
				return
			}
		}
	}
}
