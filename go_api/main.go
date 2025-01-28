package main

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type contact struct {
	ID       string `json:"id"`
	FullName string `json:"fullname"`
	Email    string `json:"email"`
	Phone    int    `json:"phone"`
	Message  string `json:"message"`
}

var contacts = []contact{
	{ID: "1", FullName: "AhmedZin",
		Email:   "ahmed@gmail.com",
		Phone:   2,
		Message: "Hi Ahmed"},
}

func getMessages(context *gin.Context) {
	context.IndentedJSON(http.StatusOK, contacts)
}

func postMessages(context *gin.Context) {

	var newContact contact

	if err := context.BindJSON(&newContact); err != nil {
		return
	}

	contacts = append(contacts, newContact)

	context.IndentedJSON(http.StatusCreated, newContact)

}

func getContactbyID(id string) (*contact, error) {
	for i, j := range contacts {
		if j.ID == id {
			return &contacts[i], nil
		}
	}

	return nil, errors.New("Contact not found")
}

func getMessage(context *gin.Context) {
	id := context.Param("id")
	contact, error := getContactbyID(id)

	if error != nil {
		context.IndentedJSON(http.StatusNotFound, gin.H{"message": "Contact not found"})
	}

	context.IndentedJSON(http.StatusOK, contact)
}

func main() {
	router := gin.Default()
	router.POST("/contactme", postMessages)
	router.GET("/contactme", getMessages)
	router.GET("/contactme/:id", getMessage)
	router.Run() // Default listens on :8080
}
