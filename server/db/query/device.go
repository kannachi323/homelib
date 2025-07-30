package query

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/kannachi323/homelib/db"
	"github.com/kannachi323/homelib/models"

	"github.com/google/uuid"
)

func AddDevice(db *db.Database, name, address, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `INSERT INTO devices (id, name, address, user_id) VALUES (?, ?, ?, ?)`
	_, err := db.DB.ExecContext(ctx, query, uuid.New().String(), name, address, userID)
	if err != nil {
		log.Printf("failed to add device: %v", err)
		return err
	}
	return nil
}

func GetDevices(db *db.Database, user_id string) ([]models.Device, error) {
	log.Println("Getting devices for user:", user_id)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `SELECT id, name, address FROM devices WHERE user_id = ?`
	rows, err := db.DB.QueryContext(ctx, query, user_id)
	if err != nil {
		log.Printf("failed to get devices: %v", err)
		return nil, err
	}
	defer rows.Close()

	var devices []models.Device

	for rows.Next() {
		var device models.Device
		err := rows.Scan(&device.ID, &device.Name, &device.Address)
		if err != nil {
			return nil, fmt.Errorf("failed to scan device row: %w", err)
		}
		devices = append(devices, device)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return devices, nil
}