package utils

import (
	"time"
)

type BlobI interface {
	GetFileName() string
	GetFileSize() int64
	GetFileType() string
	GetData() []byte
	GetChunkIndex() int
	GetTotalChunks() int
}

type Blob struct {
	Timestamp   time.Time
	Size        int64
	Data        []byte
	FileName    string
	FileType    string
	ChunkIndex  int
	TotalChunks int
}

func NewBlob(data []byte, fileName, fileType string, chunkIndex, totalChunks int) *Blob {
	return &Blob{
		Timestamp:   time.Now(),
		Size:        int64(len(data)),
		Data:        data,
		FileName:    fileName,
		FileType:    fileType,
		ChunkIndex:  chunkIndex,
		TotalChunks: totalChunks,
	}
}

func (b *Blob) GetFileName() string {
	if b.FileName != "" {
		return b.FileName
	}
	return b.Timestamp.Format(time.RFC3339) + ".blob"
}

func (b *Blob) GetFileSize() int64 {
	return b.Size
}

func (b *Blob) GetFileType() string {
	if b.FileType != "" {
		return b.FileType
	}
	return "application/octet-stream"
}

func (b *Blob) GetData() []byte {
	return b.Data
}

func (b *Blob) GetChunkIndex() int {
	return b.ChunkIndex
}

func (b *Blob) GetTotalChunks() int {
	return b.TotalChunks
}

func (b *Blob) GetProgress() float64 {
	if b.TotalChunks == 0 {
		return 0
	}
	return float64(b.ChunkIndex + 1) / float64(b.TotalChunks) * 100
}