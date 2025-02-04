package controllers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Login(context *gin.Context) {

	//get email/password

	var body models.User
	var user models.User

	if err := context.BindJSON(&body); err != nil {

		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to read body",
		})

		return
	}

	//query into DB to check if valid user

	initializers.DB.First(&user, "email = ?", body.Email)

	fmt.Println("user id is :", user.ID)

	if user.ID == 0 {

		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Email or Password incorrect! Invalid User!",
		})

		return
	}

	//fmt.Println("retreived user is " + user.Email + " password " + user.Password) // in case you forget .First( rak tarmiha fi variable jdida)

	//compare password with hashed password

	error := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if error != nil {

		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Email or Password incorrect! Invalid User!",
		})

		return

	}

	//if valid generate jwt token

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRETKEY")))

	if err != nil {

		context.IndentedJSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to generate Token!",
		})

		return

	}

	//send it back

	context.SetSameSite(http.SameSiteLaxMode)
	context.SetCookie("Authorization", tokenString, 3600*24, "", "", false, true)

	context.IndentedJSON(http.StatusOK, gin.H{
		"JWT_Token": tokenString,
	})

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

}

func Validate(context *gin.Context) {

	user, _ := context.Get("User")

	//user.(models.User).Email //ect...

	context.IndentedJSON(http.StatusOK, gin.H{
		"Logged in user": user,
	})
}
