package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type contact struct {
	id       int
	fullName string
	email    string
	phone    int
	message  string
}

var contacts []contact

func postMessages(context *gin.Context) {

	var newContact contact

	if err := context.BindJSON(&newContact); err != nil {
		return
	}

	contacts = append(contacts, newContact)

	context.IndentedJSON(http.StatusCreated, newContact)

}

func getMessages(context *gin.Context) {
	
}

func main() {
	router := gin.Default()
	router.POST("/contactme", postMessages)
	router.GET("/contactme", getMessages)
	router.Run() // Default listens on :8080
}
