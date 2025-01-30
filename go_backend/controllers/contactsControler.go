package controllers

import (
	"net/http"

	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/models"
	"github.com/gin-gonic/gin"
)

func MessageCreate(context *gin.Context) {
	//var message string
	var newMessage []models.Messages

	if err := context.BindJSON(&newMessage); err != nil {
		return
	}

	result := initializers.DB.Create(&newMessage)

	if result.Error != nil {
		context.Status(400)
		return
	}

	//message = fmt.Sprintf("Rows affected: %d", result.RowsAffected)
	context.IndentedJSON(http.StatusCreated, newMessage)

}

func MessagesRetreive(context *gin.Context) {
	//var message string
	var Messages []models.Messages

	result := initializers.DB.Find(&Messages)

	if result.Error != nil {
		context.Status(400)
		return
	}

	context.IndentedJSON(http.StatusCreated, Messages)

}

func MessagesRetreivebyID(context *gin.Context) {
	//var message string
	var Message models.Messages

	id := context.Param("id")

	result := initializers.DB.First(&Message, id)

	if result.Error != nil {
		context.Status(400)
		return
	}

	context.IndentedJSON(http.StatusCreated, Message)

}
