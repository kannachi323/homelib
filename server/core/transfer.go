package core

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
)

type TransferHandler struct {
	WorkerPools map[string]*WorkerPool //taskID -> WorkerPool
	Mu       sync.RWMutex
}

type TransferReqBody struct {
	SrcClientID string `json:"src_client_id"`
	DstClientID string `json:"dst_client_id"`
}

type TransferTask string

const (
	Join  				TransferTask = "join"
	UploadStart 		TransferTask = "upload-start"
	UploadComplete 		TransferTask = "upload-complete"
	UploadError 		TransferTask = "upload-error"
	DownloadStart 		TransferTask = "download-start"
	DownloadComplete 	TransferTask = "download-complete"
	DownloadError 		TransferTask = "download-error"
)

func NewTransferHandler() *TransferHandler {
	return &TransferHandler{
		WorkerPools: make(map[string]*WorkerPool),
	}
}

func (s *TransferHandler) HandleChannel(client *Client, req *ClientRequest, ch *Channel) {
	//we can get info from the client request body, it shoudl be of type TransferBody
	log.Println("Handling transfer request:", req)

	switch req.Task {
	case string(Join):
		s.JoinTransfer(client, req, ch)
	case string(UploadStart):
		s.UploadStart(client, req, ch)
	case string(UploadComplete):
		s.UploadComplete(client, req, ch)
	}
}

func (s *TransferHandler) JoinTransfer(client *Client, req *ClientRequest, ch *Channel) error {
	if err := ch.AddToChannel(client); err != nil {
		log.Println("Error adding client to channel:", err)
		return errors.New("failed to join transfer channel")
	}

	res := &ChannelResponse{
		ClientID: req.ClientID,
		GroupID: req.GroupID,
		ChannelName: req.ChannelName,
		Task: req.Task,
		TaskID: req.TaskID,
		Success: true,
		Error: "",
	}

	if err := ch.SendToClient(res, client); err != nil {
		log.Println("Error broadcasting join message:", err)
		return errors.New("failed to send join message")
	}

	return nil
}

func (s *TransferHandler) UploadStart(client *Client, req *ClientRequest, ch *Channel) error {
	//req data should contain the src/dst clientID
	var body TransferReqBody
	if err := json.Unmarshal(req.Body, &body); err != nil {
		log.Println("Error unmarshalling transfer request body:", err)
		return errors.New("failed to parse transfer request body")
	}

	log.Println("Transfer request body:", body.DstClientID, body.SrcClientID)

	log.Println(ch.Clients);
	

	dstClient, err := ch.GetClient(body.DstClientID);
	if err != nil {
		log.Println("Error getting destination client:", err)
		return errors.New("failed to get destination client")
	}

	//we create a worker pool to listen for blobs fromt the src client
	workerPool := NewWorkerPool(4, client.ChannelManager)
	log.Println("Creating worker pool for task ID:", req.TaskID)
	s.AddWorkerPool(req.TaskID, workerPool)

	res := &ChannelResponse{
		ClientID: req.ClientID,
		GroupID: req.GroupID,
		ChannelName: req.ChannelName,
		Task: string(UploadStart),
		TaskID: req.TaskID,
		Success: true,
		Error: "",
	}

	if err := ch.SendToClient(res, dstClient); err != nil {
		log.Println("Error sending upload start message:", err)
		return errors.New("failed to send upload start message")
	}
	return nil
}

func (s *TransferHandler) UploadComplete(client *Client, req *ClientRequest, ch *Channel) error {
	log.Println("Upload complete for task ID:", req.TaskID)

	// Get the worker pool for this task
	workerPool, ok := s.GetWorkerPool(req.TaskID)
	if !ok {
		log.Println("No worker pool found for task ID:", req.TaskID)
		return errors.New("no worker pool found for task")
	}

	// Signal workers to stop processing
	workerPool.mu.Lock()
	defer workerPool.mu.Unlock()
	for _, worker := range workerPool.Workers {
		close(worker.Queue)
	}

	delete(s.WorkerPools, req.TaskID)

	res := &ChannelResponse{
		ClientID: req.ClientID,
		GroupID: req.GroupID,
		ChannelName: req.ChannelName,
		Task: string(UploadComplete),
		TaskID: req.TaskID,
		Success: true,
		Error: "",
	}

	if err := ch.Broadcast(res); err != nil {
		log.Println("Error broadcasting upload complete message:", err)
		return errors.New("failed to broadcast upload complete message")
	}

	return nil

}


//Helper funcs
func (s *TransferHandler) AddWorkerPool(key string, pool *WorkerPool) {
	s.Mu.Lock()
	defer s.Mu.Unlock()
	s.WorkerPools[key] = pool
}

func (s *TransferHandler) GetWorkerPool(key string) (*WorkerPool, bool) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()
	pool, ok := s.WorkerPools[key]
	return pool, ok
}
