package server

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"homelib/api"
	"homelib/db"
	"homelib/middleware"
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

	s.MountHandlers()
	s.MountDatabase()

	
	return s
}

func (s *Server) MountDatabase() {
	err := s.DB.Start()

	if err != nil {
		panic("Failed to connect to the database: " + err.Error())
	}
}

func (s *Server) MountHandlers() {
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Or "*"
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))


	s.Router.Post("/file", api.Upload())
	s.Router.Get("/file", api.Download())
	s.Router.Get("/files-zip", api.DownloadZip())
	s.Router.With(middleware.ValidatePathMiddleware).Get("/files", api.ListFiles())
	
	s.Router.Get("/disks", api.ListDisks())

	s.Router.Post("/signup", api.SignUp(s.DB))
	s.Router.Post("/login", api.LogIn(s.DB))


	//user stuff
	s.Router.With(middleware.AuthMiddleware).Get("/user", api.GetUser(s.DB))
	
	
}
