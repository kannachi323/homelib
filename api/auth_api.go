package api

import (
	"encoding/json"
	"net/http"
	"playgomoku/backend/db"
	"playgomoku/backend/middleware"
	"playgomoku/backend/utils"
	"strings"
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

//auth always returns a user-like object with username and id
type AuthResponse struct {
	Username string `json:"username"`
	UserID string `json:"id"`
}

func RefreshAuth(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("refresh_token")
		if err != nil || cookie.Value == "" {
			http.Error(w, "missing refresh token", http.StatusUnauthorized)
			return
		}

		refreshToken := cookie.Value

		userID, err := utils.VerifyJWT(refreshToken)
		if err != nil {
			http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
			return
		}

		newAccessToken, err := utils.GenerateAccessJWT(userID)
		if err != nil {
			http.Error(w, "Failed to generate new access token", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    newAccessToken,
			Path:     "/",
			MaxAge:   3600, // 15 minutes
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
		})

		w.WriteHeader(http.StatusOK)

	}
}

func CheckAuth(db *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.ContextKey("userID")).(string)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		email, err := db.GetUserByID(userID)
		if err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(&AuthResponse{
			Username: strings.Split(email, "@")[0],
			UserID: userID,
		})
	}

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

func LogOut() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value(middleware.ContextKey("userID")).(string)

		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name: "access_token",
			Value: "",
			Path: "/",
			HttpOnly: true,
			Secure: false, //MUST SET TO TRUE IN PRODUCTION
			SameSite: http.SameSiteLaxMode,
			MaxAge: -1,
		})
	}
}
