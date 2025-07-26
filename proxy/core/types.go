package core


type ClientRequest struct {
    ClientID string `json:"client_id"`
    Channel string      `json:""`
    Message string   `json:"data"`
}

type ServerResponse struct {
	Channel string    `json:"channel"`
    Message string   `json:"message"`
}


