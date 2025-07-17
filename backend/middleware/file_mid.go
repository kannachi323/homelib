package middleware

import (
	"net/http"
	"os"
)

func ValidatePathMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Query().Get("path")

		// Fallback to some BASE_URL or reject if empty
		if path == "" {
			path = os.Getenv("BASE_URL")
			if path == "" {
				http.Error(w, "Missing path parameter", http.StatusBadRequest)
				return
			}
		}

		_, err := os.Stat(path)
		if err != nil {
			http.Error(w, "Invalid path: "+err.Error(), http.StatusBadRequest)
			return
		}

		next.ServeHTTP(w, r)
	})
}
