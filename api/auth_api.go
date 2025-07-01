package api

import (
	"encoding/json"
	"homelib/db"
	"homelib/utils"
	"log"
	"net/http"
)


type SignUpRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
	// more fields later...
}

type LogInRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
}


func SignUp(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req SignUpRequest

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		err = db.CreateUser(req.Email, req.Password)
		if err != nil {
			log.Println(err.Error())
			if err.Error() == "user already exists" {
				http.Error(w, "User already exists", http.StatusConflict)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

func LogIn(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LogInRequest

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		id, err := db.GetUserByEmailPassword(req.Email, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		token, err := utils.GenerateAccessJWT(id)

		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    token,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, //MUST SET TO TRUE IN PRODUCTION
			SameSite: http.SameSiteLaxMode,
			MaxAge:   3600,
		})

		http.SetCookie(w, &http.Cookie{
			Name: "refresh_token",
			Value: "token",
			Path: "/",
			HttpOnly: true,
			Secure: false, //MUST SET TO TRUE IN PRODUCTION
			SameSite: http.SameSiteLaxMode,
			MaxAge: 3600 * 24 * 30, // 30 days
		})
		w.WriteHeader(http.StatusOK)
	}
}

