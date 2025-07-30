package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"github.com/kannachi323/homelib/api"
	"github.com/kannachi323/homelib/core"
	"github.com/kannachi323/homelib/db"
	"github.com/kannachi323/homelib/middleware"
)

type Server struct {
	Router *chi.Mux
	DB    *db.Database
	ClientManager *core.ClientManager
	ChannelManager *core.ChannelManager
}

func CreateServer() *Server {
	channelManager := core.NewChannelManager()
	clientManager := core.NewClientManager()

    s := &Server{
		Router: chi.NewRouter(),
		DB: &db.Database{},
		ClientManager: clientManager,
		ChannelManager: channelManager,
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


	// Files
	s.Router.Post("/file", api.Upload())
	s.Router.Get("/file", api.Download())
	s.Router.Get("/files-zip", api.DownloadZip())
	s.Router.With(middleware.ValidatePathMiddleware).Get("/files", api.ListFiles())
	
	// Disks
	s.Router.Get("/disks", api.ListDisks())
	s.Router.Get("/home", api.GetLocalUserHome())

	// Auth
	s.Router.Post("/signup", api.SignUp(s.DB))
	s.Router.Post("/login", api.LogIn(s.DB))

	
	// Users
	s.Router.With(middleware.AuthMiddleware).Get("/user", api.GetUser(s.DB))


	// Devices
	s.Router.With(middleware.AuthMiddleware).Post("/device", api.AddDevice(s.DB))
	s.Router.With(middleware.AuthMiddleware).Get("/devices", api.GetDevices(s.DB))



	s.Router.Get("/ws", api.CreateConn(s.ClientManager, s.ChannelManager))
	s.Router.Get("/ipify", api.GetPublicIP())

}
