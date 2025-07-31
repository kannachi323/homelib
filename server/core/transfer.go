package core

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"
)

type TransferHandler struct {
	Sessions map[string]*WorkerPool
	Mu       sync.RWMutex
}

type TransferReqBody struct {
	Dst string `json:"dst"`
	Src string `json:"src"`
}

type TransferResult struct {
	Message string `json:"message"`
}

type TransferStatus string

const (
	Join  				TransferStatus = "join"
	Upload 				TransferStatus = "upload"
	UploadStart 		TransferStatus = "upload-start"
	UploadComplete 		TransferStatus = "upload-complete"
	UploadError 		TransferStatus = "upload-error"
	Download 			TransferStatus = "download"
	DownloadStart 		TransferStatus = "download-start"
	DownloadComplete 	TransferStatus = "download-complete"
)

func NewTransferHandler() *TransferHandler {
	return &TransferHandler{
		Sessions: make(map[string]*WorkerPool),
	}
}

func (s *TransferHandler) HandleChannel(client *Client, req *ClientRequest, ch *Channel) {
	//we can get info from the client request body, it shoudl be of type TransferBody
	log.Println("Handling transfer request:", req)

	switch req.Task {
	case string(Join):
		s.JoinTransfer(client, req, ch)
	case string(Upload):
		s.Upload(client, req, ch)
	}
}

func (s *TransferHandler) CreateChannelResponse(clientID, channel, task string, success bool, errMsg string) *ChannelResponse {
	return &ChannelResponse{
		ClientID: clientID,
		Channel:  channel,
		Task:     task,
		Success:  success,
		Error:    errMsg,
	}
}

func (s *TransferHandler) JoinTransfer(client *Client, req *ClientRequest, ch *Channel) error {
	log.Println("Joining transfer channel:", req.ChannelName)
	if err := ch.AddToChannel(client); err != nil {
		log.Println("Error adding client to channel:", err)
		return errors.New("failed to join transfer channel")
	}

	res := s.CreateChannelResponse(
		req.ClientID,
		req.ChannelName,
		req.Task,
		true,
		"",
	)

	if err := ch.SendToClient(res, client); err != nil {
		log.Println("Error broadcasting join message:", err)
		return errors.New("failed to send join message")
	}

	return nil
}

func (s *TransferHandler) Upload(client *Client, req *ClientRequest, ch *Channel) error {
	//req data should contain the src/dst clientID
	var body TransferReqBody
	if err := json.Unmarshal(req.Body, &body); err != nil {
		log.Println("Error unmarshalling transfer request body:", err)
		return errors.New("failed to parse transfer request body")
	}

	log.Println("Starting upload from", body.Src, "to", body.Dst)

	//let the dst client know that we are uploading
	//they must now start a transfer session
	dstClient, err := ch.GetClient(body.Dst);
	if err != nil {
		log.Println("Error getting destination client:", err)
		return errors.New("failed to get destination client")
	}

	//we create a worker pool to listen for blobs fromt the src client
	workerPool := NewWorkerPool(4, client.ChannelManager)
	sessionKey := fmt.Sprintf("%s->%s", body.Src, body.Dst)
	s.AddSession(sessionKey, workerPool)

	//let client know we are starting the upload
	res := s.CreateChannelResponse(client.ID, req.ChannelName, string(UploadStart), true, "")

	ch.SendToClient(res, dstClient)

	
	//we now wait for worker pool to finish and then send a completion message
	workerPool.OnDone(func() error {
		res := s.CreateChannelResponse(
			client.ID,
			req.ChannelName,
			req.Task,
			true,
			"",
		)

		if err := ch.SendToClient(res, dstClient); err != nil {
			log.Println("Error sending upload completion message:", err)
			return errors.New("failed to send upload completion message")
		}

		return nil
	})	
	
	return nil
}


//Helper funcs
func (s *TransferHandler) AddSession(key string, pool *WorkerPool) {
	s.Mu.Lock()
	defer s.Mu.Unlock()
	s.Sessions[key] = pool
}

func (s *TransferHandler) GetSession(key string) (*WorkerPool, bool) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()
	pool, ok := s.Sessions[key]
	return pool, ok
}
