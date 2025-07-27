package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"proxy/api"
	"proxy/core"
)

type Proxy struct {
	Router *chi.Mux
	ClientManager *core.ClientManager
	ChannelManager *core.ChannelManager
}

func CreateProxy() *Proxy {

	channelManager := core.NewChannelManager()
	clientManager := core.NewClientManager()

    p := &Proxy{
		Router: chi.NewRouter(),
		ClientManager: clientManager,
		ChannelManager: channelManager,
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
	p.Router.Get("/ws", api.CreateConn(p.ClientManager, p.ChannelManager))
	p.Router.Get("/ipify", api.GetPublicIP())
	p.Router.Get("/pub", api.PubToChannel())
	p.Router.Get("/sub", api.SubToChannel())

	
}



