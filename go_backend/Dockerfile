# Build stage
FROM golang:1.22.11-alpine3.21 AS builder
WORKDIR /app

# Copy go mod files
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy source files
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /go_backend main.go

# Runtime stage
FROM alpine:3.18
WORKDIR /app

# Copy built binary and .env file
COPY --from=builder /go_backend .
COPY .env .

# Expose the port your application runs on (change if different)
EXPOSE 8080

# Command to run the application
CMD ["./go_backend"]