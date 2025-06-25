package utils

import "time"

// blob is a struct that hold binary data + metadata


type BlobI interface {
	GetFileName() string
	GetFileSize() int64
	GetFileType() string
}

type Blob struct {
	timestamp string
	Size int
	data []byte
}

func NewBlob(data []byte) *Blob {
	return &Blob{
		timestamp: time.Now().Format(time.RFC3339),
		Size: len(data),
		data: data,
	}
}

func (b *Blob) GetFileName() string {
	return b.timestamp + ".blob"
}

func (b *Blob) GetFileSize() int64 {
	return int64(b.Size)
}

func (b *Blob) GetFileType() string {
	// For simplicity, we assume all blobs are of type "text"
	// In a real application, you might want to determine the type based on the content or file extension
	return "text"
}


