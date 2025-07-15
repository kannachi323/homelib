package middleware

import (
	"context"
	"homelib/utils"
	"net/http"
)

type ContextKey string

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        cookie, err := r.Cookie("access_token")
        if err != nil {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }

        tokenStr := cookie.Value
        userID, err := utils.VerifyJWT(tokenStr)
        if err != nil {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }

        if userID == "" {
            http.Error(w, "userID is invalid", http.StatusUnauthorized)
            return
        }

        ctx := context.WithValue(r.Context(), ContextKey("userID"), userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}