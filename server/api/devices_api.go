package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/kannachi323/homelib/db"
	"github.com/kannachi323/homelib/db/query"
	"github.com/kannachi323/homelib/middleware"
	"github.com/kannachi323/homelib/models"
)

func AddDevice(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userIDVal := r.Context().Value(middleware.UserIDKey)
		userID, ok := userIDVal.(string)
		if !ok || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var device models.Device
		if err := json.NewDecoder(r.Body).Decode(&device); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		device.UserID = userID //must use server userid bc it's authoritative

		log.Println("Adding device:", device.Address)
		log.Println("Device UserID:", device.UserID)
		log.Println("Device Name:", device.Name)

		if device.Name == "" || device.Address == "" || device.UserID == "" {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		query.AddDevice(db, device.Name, device.Address, device.UserID)
		w.WriteHeader(http.StatusCreated)
	}
}

func GetDevices(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userIDVal := r.Context().Value(middleware.UserIDKey)
		userID, ok := userIDVal.(string)
		if !ok || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		devices, err := query.GetDevices(db, userID)
		if err != nil {
			http.Error(w, "Failed to fetch devices", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(devices)
	}
}