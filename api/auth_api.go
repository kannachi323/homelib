package api

import (
	"encoding/json"
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


func SignUp() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req SignUpRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		//TODO: implmement database logic to save user
		
		w.WriteHeader(http.StatusCreated)
	}
}


