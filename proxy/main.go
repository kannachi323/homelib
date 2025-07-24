package main

import (
	"net/http"
)

func main() {
	p := CreateProxy()

	p.MountHandlers()


	
	http.ListenAndServe(":8000", p.Router)
}