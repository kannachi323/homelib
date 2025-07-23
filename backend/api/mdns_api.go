package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/hashicorp/mdns"
)


func MDNSDiscover() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		entriesCh := make(chan *mdns.ServiceEntry)
		results := []*mdns.ServiceEntry{}

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		go func() {
			for entry := range entriesCh {
				results = append(results, entry)
				fmt.Printf("Got new entry: %v\n", entry)
			}
		}()

		go func() {
			mdns.Lookup("_homelib._tcp", entriesCh)
			close(entriesCh)
		}()

		// Wait for timeout or request cancel
		<-ctx.Done()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}

