package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	s := CreateServer()
	defer s.DB.Stop()

	log.Println("Starting server on :8080")

	http.ListenAndServe(":8080", s.Router)


	

}

