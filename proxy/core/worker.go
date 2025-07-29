package core

import (
	"log"
	"sync"

	"github.com/kannachi323/homelib/proxy/protob"
)

type Worker struct {
	ID int
	Queue chan *protob.Blob
	ChannelManager *ChannelManager
}

func NewWorker(id int, chm *ChannelManager) *Worker {
	return &Worker{
		ID:    id,
		Queue: make(chan *protob.Blob, 32),
		ChannelManager: chm,
	}
}

func (w *Worker) StartWorker() {
	go func() {
		for blob := range w.Queue {
			log.Printf("[Worker %d] Processing chunk #%d from file %s\n", w.ID, blob.ChunkIndex, blob.FileName)
			// blob contains info about which client to send to
			channel, err := w.ChannelManager.GetChannel(blob.GetChannelName())
			if err != nil {
				log.Printf("[Worker %d] Error getting channel %s: %v\n", w.ID, blob.GetChannelName(), err)
				continue
			}
			dst, err := channel.GetClient(blob.GetDst())
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
	defer p.mu.Unlock()

	worker := p.Workers[p.next]
	select {
	case worker.Queue <- blob:
		log.Printf("[WorkerPool] Dispatched chunk #%d to worker %d", blob.ChunkIndex, worker.ID)
	default:
		log.Printf("[Worker %d] queue full, dropping chunk #%d\n", worker.ID, blob.ChunkIndex)
	}

	p.next = (p.next + 1) % len(p.Workers)
}
