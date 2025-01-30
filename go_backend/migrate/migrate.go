package main

import (
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()

}

func main() {
	initializers.DB.AutoMigrate(&models.Messages{})
}
