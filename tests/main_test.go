package tests

import (
	"bytes"
	"crypto/rand"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"homelib/server"
	"homelib/utils"

	"github.com/stretchr/testify/require"
)

func GenerateRandomBytes(n int) ([]byte, error) {
    b := make([]byte, n)
    _, err := rand.Read(b)
    if err != nil {
        return nil, err
    }
    return b, nil
}

func executeRequest(req *http.Request, s *server.Server) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	s.Router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}


func TestQueueWithBlobSmall(t *testing.T) {
	queue := utils.NewQueue[utils.Blob](5)

	for i := 0; i < 10; i++ {
		data, err := GenerateRandomBytes(100)
		require.NoError(t, err, "Failed to generate random bytes")
		blob := utils.NewBlob(data)

		queue.Enqueue(blob)
	}

	for i := 0; i < queue.Size; i++ {
		blob := queue.Dequeue()
		require.NotNil(t, blob, "Blob should not be nil")
		require.Equal(t, 100, blob.Size, "Blob size should match expected value")
		require.Equal(t, "text", blob.GetFileType(), "Blob file type should be string")
	}

}

func TestQueueWithBlobMedium(t *testing.T) {
	queue := utils.NewQueue[utils.Blob](5)

	for i := 0; i < 10; i++ {
		data, err := GenerateRandomBytes(10000)
		require.NoError(t, err, "Failed to generate random bytes")
		blob := utils.NewBlob(data)

		queue.Enqueue(blob)
	}

	for i := 0; i < queue.Size; i++ {
		blob := queue.Dequeue()
		require.NotNil(t, blob, "Blob should not be nil")
		require.Equal(t, 10000, blob.Size, "Blob size should match expected value")
		require.Equal(t, "text", blob.GetFileType(), "Blob file type should be string")
	}

}

func TestQueueWithBlobLarge(t *testing.T) {
	queue := utils.NewQueue[utils.Blob](5)

	for i := 0; i < 10; i++ {
		data, err := GenerateRandomBytes(1000000)
		require.NoError(t, err, "Failed to generate random bytes")
		blob := utils.NewBlob(data)

		queue.Enqueue(blob)
	}

	for i := 0; i < queue.Size; i++ {
		blob := queue.Dequeue()
		require.NotNil(t, blob, "Blob should not be nil")
		require.Equal(t, 1000000, blob.Size, "Blob size should match expected value")
		require.Equal(t, "text", blob.GetFileType(), "Blob file type should be string")
	}
}

func TestUploadSmall(t *testing.T) {
	s := server.CreateServer()
	server.MountHandlers(s)

	file, err := os.Open("../data/small.blob")
	require.NoError(t, err, "Failed to open small file")
	defer file.Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filepath.Base(file.Name()))
	require.NoError(t, err, "Failed to create form file")

	_, err = io.Copy(part, file)
	require.NoError(t, err, "Failed to copy file content to form file")
	writer.Close()

	req := httptest.NewRequest("POST", "/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())


	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)

}

func TestUploadMedium(t *testing.T) {
	s := server.CreateServer()
	server.MountHandlers(s)

	file, err := os.Open("../data/medium.blob")
	require.NoError(t, err, "Failed to open small file")
	defer file.Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filepath.Base(file.Name()))
	require.NoError(t, err, "Failed to create form file")

	_, err = io.Copy(part, file)
	require.NoError(t, err, "Failed to copy file content to form file")
	writer.Close()

	req := httptest.NewRequest("POST", "/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())


	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)

}


func TestUploadLarge(t *testing.T) {
	s := server.CreateServer()
	server.MountHandlers(s)

	file, err := os.Open("../data/large.blob")
	require.NoError(t, err, "Failed to open small file")
	defer file.Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filepath.Base(file.Name()))
	require.NoError(t, err, "Failed to create form file")

	_, err = io.Copy(part, file)
	require.NoError(t, err, "Failed to copy file content to form file")
	writer.Close()

	req := httptest.NewRequest("POST", "/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())


	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)

}





