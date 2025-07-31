package api

import (
	"encoding/json"
	"net/http"

	"github.com/kannachi323/homelib/db"
	"github.com/kannachi323/homelib/db/query"
	"github.com/kannachi323/homelib/middleware"
)

type UserResponse struct {
	UserID   string `json:"userID"`
	Email    string `json:"email"`
	Name string `json:"name"`
}


func GetUser(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(middleware.UserIDKey).(string)

		email, err := query.GetUserEmail(db, userID)
		if err != nil {
			http.Error(w, "Failed to get user email", http.StatusInternalServerError)
			return
		}

		fullName, err := query.GetUserFullName(db, userID)
		if err != nil {
			http.Error(w, "Failed to get user full name", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(UserResponse{
			UserID:   userID,
			Email:    email,
			Name: fullName,
		})
	}
}