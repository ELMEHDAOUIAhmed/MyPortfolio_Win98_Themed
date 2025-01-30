package main

//CompileDaemon -command="./go_backend"

import (
	"log"
	"os"

	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/controllers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/gin-gonic/gin"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()

}

func main() {
	r := gin.Default()
	r.POST("/contactme", controllers.MessageCreate)
	r.GET("/contactme", controllers.MessagesRetreive)
	r.GET("/contactme/:id", controllers.MessagesRetreivebyID)

	    // Load .env file for local development
		if err := godotenv.Load(); err != nil {
			panic("Error loading .env file")
		}

	app := fiber.New()

	app.Get("/env", func(c *fiber.Ctx) error {
		return c.SendString("Hello, ENV! " + os.Getenv("PORT"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Panicf("ERROR :%s", err)
	}
}
