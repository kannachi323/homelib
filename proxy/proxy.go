package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"proxy/api"
	"proxy/core"
	"proxy/manager"
)

type Proxy struct {
	Router *chi.Mux
	ChannelManager *manager.ChannelManager
	ClientManager *manager.ClientManager
}

func CreateProxy() *Proxy {
    p := &Proxy{
		Router: chi.NewRouter(),
		ChannelManager: manager.CreateChannelManager(),
		ClientManager: manager.CreateClientManager(),
	}

	p.MountHandlers()
	
	return p
}

func (p *Proxy) MountHandlers() {
	p.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Or "*"
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))
	p.Router.Get("/ws", api.CreateConn(p.ChannelManager))
	p.Router.Get("/ipify", api.GetPublicIP())
	p.Router.Get("/pub", api.PubToChannel())
	p.Router.Get("/sub", api.SubToChannel())
}



func CreateClients() map[string]*core.Client {
	clients := make(map[string]*core.Client)
	clients["default"] = core.NewClient("default", "Default Client", nil)
	return clients
}