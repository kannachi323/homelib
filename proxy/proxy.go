package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"proxy/api"
)

type Proxy struct {
	Router *chi.Mux
}

func CreateProxy() *Proxy {
    s := &Proxy{
		Router: chi.NewRouter(),
	}

	s.MountHandlers()

	
	return s
}



func (s *Proxy) MountHandlers() {
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Or "*"
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))


	s.Router.Post("/ipify", api.GetPublicIP())
	
	
	
}