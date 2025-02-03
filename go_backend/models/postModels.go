package models

import (
	"gorm.io/gorm"
)

type Messages struct {
	gorm.Model
	FullName string
	Email    string
	Phone    int
	Message  string
}

type User struct {
	gorm.Model
	Email    string `gorm:"unique"`
	Password string
}
