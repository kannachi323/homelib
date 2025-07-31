package core

import (
	"log"
	"sync"

	"github.com/kannachi323/homelib/protob"
)

type Worker struct {
	ID             int
	Queue          chan *protob.Blob
	ChannelManager *ChannelManager
}

func NewWorker(id int, chm *ChannelManager) *Worker {
	return &Worker{
		ID:             id,
		Queue:          make(chan *protob.Blob, 32),
		ChannelManager: chm,
	}
}

func (w *Worker) StartWorker() {
	go func() {
		for blob := range w.Queue {
			log.Printf("[Worker %d] Processing chunk #%d from file %s\n", w.ID, blob.ChunkIndex, blob.FileName)

			channel, err := w.ChannelManager.GetChannel(blob.GetChannelName())
			if err != nil {
				log.Printf("[Worker %d] Error getting channel %s: %v\n", w.ID, blob.GetChannelName(), err)
				continue
			}
			dst, err := channel.GetClient(blob.GetDst())
			if err != nil {
				log.Printf("[Worker %d] Error getting client %s: %v\n", w.ID, blob.GetDst(), err)
				
				continue
			}

			channel.SendToClient(blob, dst)

			if blob.GetChunkIndex() == blob.GetTotalChunks()-1 {
				res := &ChannelResponse{
					ClientID: blob.Dst, 
					Channel: blob.ChannelName,
					Task:    "upload-complete",
					TaskID:  "",
					Success: true,
					Error:   "",
				}

				if err := channel.SendToClient(res, dst); err != nil {
					log.Printf("[Worker %d] Error sending upload completion message: %v", w.ID, err)
				} else {
					log.Printf("[Worker %d] Upload complete message sent to client %s", w.ID, blob.GetDst())
				}
			}
		}
	}()
}


type WorkerPool struct {
	Workers []*Worker
	next    int
	mu      sync.Mutex
	done    chan ChannelResponse
}

func NewWorkerPool(num int, chm *ChannelManager) *WorkerPool {

	pool := &WorkerPool{
		Workers: make([]*Worker, num),
		next: 0,
		done: make(chan ChannelResponse),
	}
	for i := 0; i < num; i++ {
		w := NewWorker(i, chm)
		pool.Workers[i] = w
		w.StartWorker()
	}
	log.Println("[WorkerPool] Creating worker pool with", num, "workers")
	return pool
}

func (p *WorkerPool) Dispatch(blob *protob.Blob) {
	p.mu.Lock()
	worker := p.Workers[p.next]
	p.next = (p.next + 1) % len(p.Workers)
	p.mu.Unlock()

	
	select {
	case worker.Queue <- blob:
		log.Printf("[WorkerPool] Dispatched chunk #%d to worker %d", blob.ChunkIndex, worker.ID)
	default:
		log.Printf("[Worker %d] queue full, dropping chunk #%d\n", worker.ID, blob.ChunkIndex)
	}
}
