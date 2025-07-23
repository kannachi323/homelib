package api

import (
	"encoding/json"
	"homelib/db"
	"homelib/middleware"
	"net/http"
)

func GetUser(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(middleware.UserIDKey).(string)

		email, err := db.GetUserEmail(userID)
		if err != nil {
			http.Error(w, "Failed to get user email", http.StatusInternalServerError)
			return
		}

		fullName, err := db.GetUserFullName(userID)
		if err != nil {
			http.Error(w, "Failed to get user full name", http.StatusInternalServerError)
			return
		}

		type UserResponse struct {
			UserID   string `json:"userID"`
			Email    string `json:"email"`
			Name string `json:"name"`
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(UserResponse{
			UserID:   userID,
			Email:    email,
			Name: fullName,
		})
	}
}