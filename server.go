package main

import (
	"fmt"
	"net"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Server struct {
	router *chi.Mux
}

func CreateServer() *Server {
    s := &Server{
		router: chi.NewRouter(),
	}
	


	return s
}

func MountHandlers(s *Server) {
	s.router.Get("/", connect)
}

func connect(w http.ResponseWriter, r *http.Request) {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		http.Error(w, "Unable to parse remote address", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Client connected from IP: %s\n", ip)
}
