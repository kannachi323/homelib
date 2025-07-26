package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)


type Database struct {
	DB *sql.DB
}

func (db *Database) Start() error {
	dsn := os.Getenv("DATABASE_URL")

	log.Println("Connecting to SQLite database at:", dsn)

	sqliteDB, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return fmt.Errorf("failed to open SQLite DB: %w", err)
	}

	// Optional: Ping to ensure DB is reachable
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := sqliteDB.PingContext(ctx); err != nil {
		return fmt.Errorf("failed to ping SQLite DB: %w", err)
	}

	db.DB = sqliteDB
	return nil
}

func (db *Database) Stop() {
	if db.DB != nil {
		db.DB.Close()
	}
}
