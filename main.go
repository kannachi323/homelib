package main

import (
	"homelib/server"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	s := server.CreateServer()

	server.MountHandlers(s)

	http.ListenAndServe(":8080", s.Router)

}

