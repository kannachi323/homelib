package api

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
)


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
		rootPath := "/home/kannachi/projects/homelib/kannachi"
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