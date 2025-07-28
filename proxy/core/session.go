package core

import (
	"sync"

	"github.com/kannachi323/homelib/proxy/protob"
)


type TransferSession struct {
	ID string
	ChannelName string
	Chunks []*protob.Blob
	Total int
	Received int
	FileName string
	FileType string
	mu  sync.Mutex
}