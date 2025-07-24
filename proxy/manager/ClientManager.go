package manager

import "proxy/core"


type ClientManager struct {
	Clients map[string]*core.Client	
}

func CreateClientManager() *ClientManager {
	return &ClientManager{
		Clients: make(map[string]*core.Client),
	}
}