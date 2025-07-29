package core

import (
	"errors"
	"log"
	"sync"

	"github.com/google/uuid"
	"github.com/kannachi323/homelib/proxy/protob"
)


type TransferSession struct {
	ID string
	ChannelName string
	Blobs []*protob.Blob
	Total int
	Received int
	mu  sync.RWMutex
}

func NewTransferSession(channelName, fileName, fileType string, total int) *TransferSession {
	return &TransferSession{
		ID: uuid.NewString(),
		ChannelName: channelName,
		Blobs: make([]*protob.Blob, total),
		Total: total,
		Received: 0,
	}
}

func (ts *TransferSession) AddChunk(chunk *protob.Blob) error {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	if chunk.ChunkIndex < 0 || int(chunk.ChunkIndex) >= ts.Total || ts.Blobs[chunk.ChunkIndex] != nil {
		log.Println("Invalid chunk index:", chunk.ChunkIndex)
		return errors.New("invalid chunk index")
	}

	ts.Blobs[chunk.ChunkIndex] = chunk
	ts.Received++

	return nil
}

func (ts *TransferSession) IsComplete() bool {
	ts.mu.RLock()
	defer ts.mu.RUnlock()

	return ts.Received == ts.Total
}