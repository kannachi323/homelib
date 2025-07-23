package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)


type Database struct {
	DB *sql.DB
}

func (db *Database) Start() error {
	dsn := os.Getenv("DATABASE_URL")

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

func (db *Database) CreateUser(name string, email string, password string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	query := `INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)`
	_, err = db.DB.ExecContext(ctx, query, name, email, hashedPassword, 0)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	log.Println("User created successfully")
	return nil
}

func (db *Database) CheckUser(email string, password string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var id string
	var hashedPassword string
	query := `SELECT id, password FROM users WHERE email = ?`
	
	err := db.DB.QueryRowContext(ctx, query, email).Scan(&id, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("user not found")
			return "", fmt.Errorf("user not found")
		}
		log.Printf("failed to get user by email: %v", err)
		return "", fmt.Errorf("failed to get user by email: %w", err)
	}

	log.Println(hashedPassword)

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return "", fmt.Errorf("invalid password: %w", err)
	}
	return id, nil
}

func (db *Database) GetUserEmail(userID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var email string
	query := "SELECT email FROM users WHERE id = ?"
	
	err := db.DB.QueryRowContext(ctx, query, userID).Scan(&email)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("user not found")
		}
		return "", fmt.Errorf("failed to get user by ID: %w", err)
	}

	return email, nil
}

func (db *Database) GetUserFullName(userID string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var name string
	query := "SELECT name FROM users WHERE id = ?"
	
	err := db.DB.QueryRowContext(ctx, query, userID).Scan(&name)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("user not found")
		}
		return "", fmt.Errorf("failed to get user by ID: %w", err)
	}

	return name, nil
}
