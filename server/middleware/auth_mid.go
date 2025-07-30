package middleware

import (
	"context"
	"log"
	"net/http"

	"github.com/kannachi323/homelib/utils"
)

type ContextKey string

const UserIDKey ContextKey = "userID"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access_token")
		if err != nil {
			log.Println("No access token found, user is unauthorized")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		log.Println("Access token found, verifying...")

		//first let's check if access token is still valid
		userID, err := utils.VerifyJWT(cookie.Value)
		if err != nil {
			//access token invalid, so let's check if we can use refresh token
			refreshCookie, _ := r.Cookie("refresh_token")
			userID, err = utils.VerifyJWT(refreshCookie.Value)
			if err != nil {
				//refresh token invalid, so user is unauthorized
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			//use refresh token to generate new access token
			newAccessToken, err := utils.GenerateAccessJWT(userID)
			if err != nil {
				http.Error(w, "Failed to generate new access token", http.StatusInternalServerError)
				return
			}
			http.SetCookie(w, &http.Cookie{
				Name:     "access_token",
				Value:    newAccessToken,
				Path:     "/",
				HttpOnly: true,
				Secure:   false, //MUST SET TO TRUE IN PRODUCTION
				SameSite: http.SameSiteLaxMode,
				MaxAge:   3600,
			})
		}
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}