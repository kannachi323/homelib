package server

import (
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

	s.Router.Post("/file", api.Upload())
	s.Router.Get("/file", api.Download())
	s.Router.Get("/files-zip", api.DownloadZip())
	s.Router.Get("/files", api.ListFiles())

	s.Router.Post("/signup", api.SignUp())
	
}
