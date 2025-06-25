package main

import (
	"homelib/server"
	"net/http"
)

func main() {
	s := server.CreateServer()

	server.MountHandlers(s)

	http.ListenAndServe(":8080", s.Router)

}

