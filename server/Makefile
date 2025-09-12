.PHONY: help build run test clean migrate seed dev prod docker-build docker-up docker-down

# Variables
APP_NAME=library-management-server
MAIN_PATH=.
DOCKER_COMPOSE=docker-compose

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

build: ## Build the application
	go build -o bin/$(APP_NAME) $(MAIN_PATH)

run: ## Run the application
	go run $(MAIN_PATH)

test: ## Run tests
	go test -v -cover ./...

test-coverage: ## Run tests with coverage report
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

clean: ## Clean build artifacts
	rm -rf bin/
	rm -f coverage.out coverage.html

deps: ## Download dependencies
	go mod download
	go mod tidy

migrate: ## Run database migrations
	go run $(MAIN_PATH) migrate up

migrate-down: ## Rollback database migrations
	go run $(MAIN_PATH) migrate down

seed: ## Seed the database
	go run $(MAIN_PATH) seed

dev: ## Run in development mode with hot reload
	air

prod: build ## Build and run in production mode
	GIN_MODE=release ./bin/$(APP_NAME)

docker-build: ## Build Docker images
	$(DOCKER_COMPOSE) build

docker-up: ## Start Docker containers
	$(DOCKER_COMPOSE) up -d

docker-down: ## Stop Docker containers
	$(DOCKER_COMPOSE) down

docker-logs: ## View Docker logs
	$(DOCKER_COMPOSE) logs -f

docker-clean: ## Clean Docker volumes
	$(DOCKER_COMPOSE) down -v

lint: ## Run linter
	golangci-lint run

fmt: ## Format code
	go fmt ./...
	gofumpt -w .

vet: ## Run go vet
	go vet ./...

security: ## Run security scan
	gosec ./...

benchmark: ## Run benchmarks
	go test -bench=. -benchmem ./...