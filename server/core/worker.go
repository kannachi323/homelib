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
	WorkerPool    *WorkerPool
	
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

			channel, err := w.ChannelManager.GetChannel(blob.GetGroupID())
			if err != nil {
				log.Printf("[Worker %d] Error getting channel %s: %v\n", w.ID, blob.GetGroupID(), err)
				continue
			}
			dst, err := channel.GetClient(blob.GetDstClientID())
			if err != nil {
				log.Printf("[Worker %d] Error getting client %s: %v\n", w.ID, blob.GetDstClientID(), err)
				
				continue
			}

			channel.SendToClient(blob, dst)
		}
	}()
}

type WorkerPool struct {
	Workers []*Worker
	next    int
	mu      sync.Mutex
}

func NewWorkerPool(num int, chm *ChannelManager) *WorkerPool {

	pool := &WorkerPool{
		Workers: make([]*Worker, num),
		next: 0,
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
