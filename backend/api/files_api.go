package api

import (
	"archive/zip"
	"encoding/json"
	"fmt"
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
	IsDir bool   `json:"isDir"`
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
	}
}

func Download() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filePath := r.URL.Query().Get("path")

		if filePath == "" {
			http.Error(w, "File path is required", http.StatusBadRequest)
			return
		}

		file, err := os.Open(filePath)
		if err != nil {
			http.Error(w, "Failed to open file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Get file info for name and size
		info, err := file.Stat()
		if err != nil {
			http.Error(w, "Failed to get file info", http.StatusInternalServerError)
			return
		}

		// Set headers to trigger download
		w.Header().Set("Content-Disposition", "attachment; filename=\""+info.Name()+"\"")
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", info.Size()))

		// Stream file directly to response
		if _, err := io.Copy(w, file); err != nil {
			http.Error(w, "Failed to send file", http.StatusInternalServerError)
		}
	}
}

func DownloadZip() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		paths := r.URL.Query()["path"]

		if len(paths) == 0 {
			http.Error(w, "No file paths provided", http.StatusBadRequest)
			return
		}

		if len(paths) > 25 {
			http.Error(w, "Too many files requested, limit is 20", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Disposition", "attachment; filename=\"files.zip\"")

		zipWriter := zip.NewWriter(w)
		defer zipWriter.Close()

		for _, filePath := range paths {
			file, err := os.Open(filePath)
			if err != nil {
				log.Printf("Skipping file %s: %v", filePath, err)
				continue
			}
			defer file.Close()

			info, err := file.Stat()
			if err != nil {
				log.Printf("Skipping file %s: %v", filePath, err)
				continue
			}

			header, err := zip.FileInfoHeader(info)
			if err != nil {
				log.Printf("Error creating header for %s: %v", filePath, err)
				continue
			}

			header.Name = filepath.Base(filePath)
			header.Method = zip.Deflate

			writer, err := zipWriter.CreateHeader(header)
			if err != nil {
				log.Printf("Error adding file %s to zip: %v", filePath, err)
				continue
			}

			if _, err := io.Copy(writer, file); err != nil {
				log.Printf("Error writing file %s to zip: %v", filePath, err)
			}
		}

		w.WriteHeader(http.StatusOK)
	}
}

