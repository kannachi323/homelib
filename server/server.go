package server

import (
	"fmt"
	"net"
	"net/http"

	"github.com/go-chi/chi/v5"

	"homelib/api"
)

type Server struct {
	Router *chi.Mux
}

func CreateServer() *Server {
    s := &Server{
		Router: chi.NewRouter(),
	}

	return s
}

func MountHandlers(s *Server) {
	s.Router.Get("/", connect)
	s.Router.Post("/upload", api.Upload())
}

func connect(w http.ResponseWriter, r *http.Request) {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		http.Error(w, "Unable to parse remote address", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Client connected from IP: %s\n", ip)
}
