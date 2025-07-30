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
	wg             *sync.WaitGroup
}

func NewWorker(id int, chm *ChannelManager, wg *sync.WaitGroup) *Worker {
	return &Worker{
		ID:             id,
		Queue:          make(chan *protob.Blob, 32),
		ChannelManager: chm,
		wg:             wg,
	}
}

func (w *Worker) StartWorker() {
	go func() {
		for blob := range w.Queue {
			log.Printf("[Worker %d] Processing chunk #%d from file %s\n", w.ID, blob.ChunkIndex, blob.FileName)

			channel, err := w.ChannelManager.GetChannel(blob.GetChannelName())
			if err != nil {
				log.Printf("[Worker %d] Error getting channel %s: %v\n", w.ID, blob.GetChannelName(), err)
				w.wg.Done()
				continue
			}
			dst, err := channel.GetClient(blob.GetDst())
			if err != nil {
				log.Printf("[Worker %d] Error getting client %s: %v\n", w.ID, blob.GetDst(), err)
				w.wg.Done()
				continue
			}

			channel.SendToClient(blob, dst)

			w.wg.Done()
		}
	}()
}


type WorkerPool struct {
	Workers []*Worker
	next    int
	mu      sync.Mutex
	wg      sync.WaitGroup
	done    chan struct{}
}

func NewWorkerPool(num int, chm *ChannelManager) *WorkerPool {

	pool := &WorkerPool{
		Workers: make([]*Worker, num),
		next: 0,
		done: make(chan struct{}),
	}
	for i := 0; i < num; i++ {
		w := NewWorker(i, chm, &pool.wg)
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

	p.wg.Add(1)
	select {
	case worker.Queue <- blob:
		log.Printf("[WorkerPool] Dispatched chunk #%d to worker %d", blob.ChunkIndex, worker.ID)
	default:
		log.Printf("[Worker %d] queue full, dropping chunk #%d\n", worker.ID, blob.ChunkIndex)
		p.wg.Done() // since it's dropped
	}
}

//need to put this in a goroutine so it doesn't block main thread
func (p *WorkerPool) OnDone(callback func() error) {
	go func() {
		p.wg.Wait()
		if err := callback(); err != nil {
			log.Println("[WorkerPool] OnDone callback error:", err)
		}
	}()
}