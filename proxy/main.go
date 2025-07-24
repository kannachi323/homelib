package main

import (
	"net/http"
)

func main() {
	p := CreateProxy()


	 
	http.ListenAndServe(":8000", p.Router)
}