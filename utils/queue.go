package utils

import (
	"container/list"
	"fmt"
)


type Queue[T any] struct {
	items *list.List
	Capacity int
	Size int
}

func NewQueue[T any](capacity int) *Queue[T] {
	queue := &Queue[T]{
		items: list.New(),
		Capacity: capacity,
		Size: 0,
	}

	return queue
}

func (q *Queue[T]) Enqueue(item *T) {
	if q.Size >= q.Capacity {
		q.Dequeue()
	}
	q.items.PushBack(item)
	q.Size++
}

func (q *Queue[T]) Dequeue() *T {
	if q.Size == 0 {
		return nil
	}
	elem := q.items.Front()
	q.items.Remove(elem)
	q.Size--

	return elem.Value.(*T)
}

func (q *Queue[T]) PrintQueue() {
	for e := q.items.Front(); e != nil; e = e.Next() {
		item := e.Value.(*T)
		fmt.Printf("%+v\n", *item)
	}
}

func (q *Queue[T]) GetSize() int {
	return q.Size
}