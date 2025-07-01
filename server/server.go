package server

import (
	"github.com/go-chi/chi/v5"

	"homelib/api"
	"homelib/db"
)

type Server struct {
	Router *chi.Mux
	DB    *db.Database
}

func CreateServer() *Server {
    s := &Server{
		Router: chi.NewRouter(),
		DB: &db.Database{},
	}

	return s
}

func (s *Server) MountHandlers() {

	s.Router.Post("/file", api.Upload())
	s.Router.Get("/file", api.Download())
	s.Router.Get("/files-zip", api.DownloadZip())
	s.Router.Get("/files", api.ListFiles())

	s.Router.Post("/signup", api.SignUp(s.DB))
	s.Router.Post("/login", api.LogIn(s.DB))
	
}
