package api

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type IPResponse struct {
	IP        string `json:"ip"`
	Timestamp string `json:"timestamp"`
}

func GetPublicIP() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		res, err := http.Get("https://api.ipify.org")
		if err != nil {
			log.Println("Error fetching public IP:", err)
			http.Error(w, "Failed to get IP", http.StatusInternalServerError)
			return
		}
		defer res.Body.Close()

		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Println("Trouble reading response body:", err)
			http.Error(w, "Failed to read IP", http.StatusInternalServerError)
			return
		}

		response := IPResponse{
			IP:        string(body),
			Timestamp: time.Now().Format(time.RFC3339),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
