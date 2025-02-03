package controllers

import (
	"net/http"

	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Login(context *gin.Context) {

	//email := context.Param("email")
	//password := context.Param("password")

	//hash password

	//query into DB to check if valid user

	//if valid generate token and login

	//else return error

}

func Signup(context *gin.Context) {

	//get email/password

	var body models.User

	if err := context.BindJSON(&body); err != nil {

		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to read body",
		})

		return
	}

	//hash the password

	hashed_ps, error := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

	if error != nil {

		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to HASH password",
		})

		return

	}

	//insert into DB

	user := models.User{Email: body.Email, Password: string(hashed_ps)}
	result := initializers.DB.Create(&user)

	if result.Error != nil {
		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to create User",
		})
		return
	}

	context.IndentedJSON(http.StatusCreated, gin.H{
		"Success": "User created",
	})

	//generate & return token to user

}
