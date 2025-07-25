package core


type ClientRequest struct {
    Type string      `json:"type"`
    Message string   `json:"data"`
}

type ServerResponse struct {
	Channel string    `json:"channel"`
    Message string   `json:"message"`
}


