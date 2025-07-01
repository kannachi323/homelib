package tests

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"homelib/api"
	"homelib/db"
	"homelib/server"
	"homelib/utils"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/require"
)

var testDB *db.Database

func StartTestDB(testDB *db.Database) error {
	ctx := context.Background()
	dsn := os.Getenv("DATABASE_URL_TEST")

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return fmt.Errorf("unable to create connection pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	testDB.Pool = pool

	return nil
}	

func CloseTestDB(testDB *db.Database) {
	if testDB.Pool != nil {
		testDB.Pool.Close()
	}
}

func ResetTestDB(testDB *db.Database) error {
	ctx := context.Background()
	_, err := testDB.Pool.Exec(ctx, "TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	if err != nil {
		return fmt.Errorf("failed to truncate test database: %w", err)
	}
	
	sqlBytes, err := os.ReadFile("../db/sql/data.sql")
	if err != nil {
		return fmt.Errorf("failed to read SQL file: %w", err)
	}
	sql := string(sqlBytes)

	_, err = testDB.Pool.Exec(ctx, sql)
	if err != nil {
		return fmt.Errorf("failed to seed test database: %w", err)
	}
	return nil
}

func CreateTestServer() *server.Server {
	s := &server.Server{
		Router: chi.NewRouter(),
		DB: testDB, //this database is already mounted from main test setup
	}
	s.MountHandlers()

	return s
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

func GenerateRandomBytes(n int) ([]byte, error) {
    b := make([]byte, n)
    _, err := rand.Read(b)
    if err != nil {
        return nil, err
    }
    return b, nil
}



func TestMain(m *testing.M) {
	godotenv.Load("../.env")


	testDB = &db.Database{}
	err := StartTestDB(testDB)
	if err != nil {
		fmt.Println("Failed to start test DB:", err)
		os.Exit(1)
	}
	defer CloseTestDB(testDB)


	rc := m.Run()
	os.Exit(rc)

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
	s := CreateTestServer()

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

	req := httptest.NewRequest("POST", "/file", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())


	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)

}

func TestUploadMedium(t *testing.T) {
	s := CreateTestServer()


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

	req := httptest.NewRequest("POST", "/file", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())


	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)

}


func TestUploadLarge(t *testing.T) {
	s := CreateTestServer()

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

	req := httptest.NewRequest("POST", "/file", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())


	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)

}

func TestListFiles(t *testing.T) {
	s := CreateTestServer()


	req := httptest.NewRequest("GET", fmt.Sprintf("/files?path=%s", os.Getenv("BASE_URL") + "/data"), nil)
	rr := executeRequest(req, s)

	checkResponseCode(t, http.StatusOK, rr.Code)
	var fileNodes []api.FileNode

	err := json.Unmarshal(rr.Body.Bytes(), &fileNodes)
	require.NoError(t, err, "Failed to unmarshal response body")

	sort.Slice(fileNodes, func(i, j int) bool {
		return fileNodes[i].Size < fileNodes[j].Size
	})

	require.Equal(t, "small.blob", fileNodes[0].Name, nil)
	require.Equal(t, "medium.blob", fileNodes[1].Name, nil)
	require.Equal(t, "large.blob", fileNodes[2].Name, nil)
}

func TestDownloadFile(t *testing.T) {
	s := CreateTestServer()


	filePath := os.Getenv("BASE_URL") + "/data/small.blob"
	req := httptest.NewRequest("GET", fmt.Sprintf("/file?path=%s", filePath), nil)
	rr := executeRequest(req, s)

	checkResponseCode(t, http.StatusOK, rr.Code)
	require.Equal(t, "application/octet-stream", rr.Header().Get("Content-Type"))
	require.Contains(t, rr.Header().Get("Content-Disposition"), "attachment")

	expectedFileBytes, err := os.ReadFile(filePath)
	require.NoError(t, err, "Failed to read file content")

	actualFileBytes := rr.Body.Bytes()

	require.Equal(t, expectedFileBytes, actualFileBytes, "Downloaded file content does not match original file content")
}

func TestDownloadZip(t *testing.T) {
	s := CreateTestServer()

	filePaths := []string{
		os.Getenv("BASE_URL") + "/data/small.blob",
		os.Getenv("BASE_URL") + "/data/medium.blob",
		os.Getenv("BASE_URL") + "/data/large.blob",
	}

	var queryParts []string
	for _, path := range filePaths {
		queryParts = append(queryParts, "path=" + url.QueryEscape(path))
	}

	req := httptest.NewRequest("GET", fmt.Sprintf("/files-zip?%s", strings.Join(queryParts, "&")), nil)

	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusOK, rr.Code)
}

func TestCreateNewUser(t *testing.T) {
	s := CreateTestServer()


	userData := &api.SignUpRequest{
		Email: "test@gmail.com",
		Password: "test",
	}

	jsonData, err := json.Marshal(userData)
	require.NoError(t, err, "Failed to marshal user data")

	req := httptest.NewRequest("POST", "/signup", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusCreated, rr.Code)
}

func TestLogInUser(t *testing.T) {
	require.NoError(t, ResetTestDB(testDB))
	s := CreateTestServer()

	userData := &api.LogInRequest{
		Email: "testuser@gmail.com",
		Password: "test1234",
	}

	jsonData, err := json.Marshal(userData)
	require.NoError(t, err, "Failed to marshal user data")

	req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	rr := executeRequest(req, s)
	checkResponseCode(t, http.StatusOK, rr.Code)
}










