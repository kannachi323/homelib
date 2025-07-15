package main

import (
	"homelib/server"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	s := server.CreateServer()

	s.MountHandlers()

	http.ListenAndServe(":8080", s.Router)

}

