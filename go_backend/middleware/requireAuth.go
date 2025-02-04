package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/initializers"
	"github.com/ELMEHDAOUIAhmed/MyPortfolio_Win98_Themed/go_backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(tokenStrategy func(c *gin.Context) (string, error)) gin.HandlerFunc {
	return func(context *gin.Context) {
		// Get token using the specified strategy
		tokenString, err := tokenStrategy(context)
		if err != nil {

			fmt.Println("Stopped at token strategy")
			context.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Common validation logic for both web and mobile
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("SECRETKEY")), nil
		})

		if err != nil {
			context.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Common logic for handling valid token
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			//check exp
			if float64(time.Now().Unix()) > claims["exp"].(float64) {
				context.AbortWithStatus(http.StatusUnauthorized)
				return
			}

			//Find the user with token sub
			var user models.User
			initializers.DB.First(&user, claims["sub"])

			if user.ID == 0 {
				context.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			//Attach to req

			context.Set("User", user)

			//Continue to next function
			context.Next()
		} else {
			context.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		context.Next()
	}
}

// Token extraction strategies
func cookieExtractor(c *gin.Context) (string, error) {
	return c.Cookie("Authorization")
}

func paramExtractor(c *gin.Context) (string, error) {
	token := c.Param("token")
	if token == "" {
		return "", fmt.Errorf("missing token")
	}
	return token, nil
}

// middleware instances
var (
	WebAuthMiddleware    = RequireAuth(cookieExtractor)
	MobileAuthMiddleware = RequireAuth(paramExtractor)
)
