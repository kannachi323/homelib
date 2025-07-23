package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateAccessJWT(userID string) (string, error) {
    secret := os.Getenv("JWT_SECRET_KEY")

    
    claims := &jwt.RegisteredClaims{
        Subject:   userID,
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    
    return token.SignedString([]byte(secret))
}

func GenerateRefreshJWT(userID string) (string, error) {
    secret := os.Getenv("JWT_SECRET_KEY")

    claims := &jwt.RegisteredClaims{
        Subject: userID,
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    return token.SignedString([]byte(secret))
}

func VerifyJWT(tokenStr string) (string, error) {
    secret := os.Getenv("JWT_SECRET_KEY")


    token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
        return []byte(secret), nil
    })

    if err != nil || !token.Valid {
        return "", errors.New("invalid token")
    }

    claims := token.Claims.(*jwt.RegisteredClaims)
    return claims.Subject, nil
}