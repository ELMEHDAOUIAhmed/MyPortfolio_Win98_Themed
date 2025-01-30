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
