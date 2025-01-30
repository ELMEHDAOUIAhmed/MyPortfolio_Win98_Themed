package main

//CompileDaemon -command="./go_backend"

import (
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
	r.POST("/contactme", controllers.MessageCreate)
	r.GET("/contactme", controllers.MessagesRetreive)
	r.GET("/contactme/:id", controllers.MessagesRetreivebyID)
	r.Run("8080")
}
