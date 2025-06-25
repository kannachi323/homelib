package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type FileNode struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Size int64  `json:"size"`
	IsDir bool   `json:"is_dir"`
}


func Upload() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 5 << 30)

		file, header, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Failed to get uploaded file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		//TODO: need to get current users home directory
		rootPath := os.Getenv("BASE_URL")
		dstPath := filepath.Join(rootPath, header.Filename)
		dstFile, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Failed to create destination file", http.StatusInternalServerError)
			return
		}
		defer dstFile.Close()

		_, err = io.Copy(dstFile, file)
		if err != nil {
			http.Error(w, "Failed to save uploaded file", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

func ListFiles() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var path string
		if r.URL.Query().Has("path") {
			path = r.URL.Query().Get("path")
		} else {
			path = os.Getenv("BASE_URL")
		}

		log.Println(path)

		files, err := os.ReadDir(path)
		if err != nil {
			http.Error(w, "Failed to read files", http.StatusInternalServerError)
			return
		}

		var fileNodes []FileNode
		for _, file := range files {
			fileInfo, err := file.Info()
			if err != nil {
				http.Error(w, "Failed to get file info", http.StatusInternalServerError)
				return
			}
			fileNode := FileNode{
				Name: fileInfo.Name(),
				Path: filepath.Join(path, fileInfo.Name()),
				IsDir: fileInfo.IsDir(),
				Size: fileInfo.Size(),
			}

			fileNodes = append(fileNodes, fileNode)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(fileNodes)
		w.WriteHeader(http.StatusOK)
	}
}