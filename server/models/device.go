package models


type Device struct {
	ID 	string `json:"id"`
	Name string `json:"name"`
	Address string `json:"address"`
	UserID string `json:"user_id,omitempty"`
}


