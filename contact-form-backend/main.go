package main
import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "Gin is working!"})
    })
    r.Run() // Default listens on :8080
}