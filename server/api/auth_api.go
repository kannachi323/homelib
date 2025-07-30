package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/kannachi323/homelib/db"
	"github.com/kannachi323/homelib/db/query"
	"github.com/kannachi323/homelib/utils"
)


type SignUpRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Password string `json:"password"`
}

type LogInRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
	RememberMe bool `json:"remember_me"`
}


func SignUp(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req SignUpRequest

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		err = query.CreateUser(db, req.Name, req.Email, req.Password)
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

		id, err := query.CheckUser(db, req.Email, req.Password)
		if err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		accessToken, err := utils.GenerateAccessJWT(id)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		refreshToken, err := utils.GenerateRefreshJWT(id)
		if err != nil {
			http.Error(w, "Failed to generate refresh token", http.StatusInternalServerError)
			return
		}
		
		var expiresAt time.Time
		if req.RememberMe {
			expiresAt = time.Now().Add(365 * 24 * time.Hour)
		} else {
			expiresAt = time.Now().Add(30 * 24 * time.Hour)
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    accessToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, //MUST SET TO TRUE IN PRODUCTION
			SameSite: http.SameSiteLaxMode,
			MaxAge:   3600,
		})

		refreshMaxAge := int(time.Until(expiresAt).Seconds())

		http.SetCookie(w, &http.Cookie{
			Name: "refresh_token",
			Value: refreshToken,
			Path: "/",
			HttpOnly: true,
			Secure: false, //MUST SET TO TRUE IN PRODUCTION
			SameSite: http.SameSiteLaxMode,
			MaxAge: refreshMaxAge,
		})
		w.WriteHeader(http.StatusOK)
	}
}

