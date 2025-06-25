package tests

import (
	"crypto/rand"
	"testing"

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




