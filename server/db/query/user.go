package query

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/kannachi323/homelib/db"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	UserID string
	Name string
	Email string
}

func CreateUser(db *db.Database, name string, email string, password string) error {
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

func GetUser(db *db.Database, email string, password string) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var id string
	var name string
	var hashedPassword string
	query := `SELECT id, name, password FROM users WHERE email = ?`
	
	err := db.DB.QueryRowContext(ctx, query, email).Scan(&id, &name, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("user not found")
			return nil, fmt.Errorf("user not found")
		}
		log.Printf("failed to get user by email: %v", err)
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("invalid password: %w", err)
	}
	
	user := &User{
		UserID: id,
		Name: name,
		Email: email,
	}

	return user, nil
}

func GetUserEmail(db *db.Database, userID string) (string, error) {
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

func GetUserFullName(db *db.Database, userID string) (string, error) {
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
