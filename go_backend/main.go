package main

//CompileDaemon -command="./go_backend"

import (
	"log"
	"os"

	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/controllers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()

}

func main() {
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.POST("/contactme", controllers.MessageCreate)
	r.GET("/contactme", controllers.MessagesRetreive)
	r.GET("/contactme/:id", controllers.MessagesRetreivebyID)
	r.POST("/signup", controllers.Signup)
	r.POST("/login", controllers.Login)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Panicf("ERROR :%s", err)
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		ctx.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		ctx.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept")
		ctx.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204) // No content for preflight requests //
			return
		}

		ctx.Next()
	}
}
