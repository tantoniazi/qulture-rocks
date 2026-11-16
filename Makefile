SHELL := /bin/bash
export LOCAL_UID := $(shell id -u)
export LOCAL_GID := $(shell id -g)
COMPOSE := docker compose
RUN_BACKEND := $(COMPOSE) run --rm backend
RUN_FRONTEND := $(COMPOSE) run --rm frontend

.DEFAULT_GOAL := help

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# --- Environment ----------------------------------------------------------

setup: build db-create db-migrate ## Build images and prepare the database
	@echo "Setup complete. Run 'make up' to start the stack."

build: ## Build docker images
	$(COMPOSE) build

up: ## Start all services in background
	$(COMPOSE) up -d

down: ## Stop all services
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

logs: ## Follow logs of all services
	$(COMPOSE) logs -f

ps: ## List running services
	$(COMPOSE) ps

# --- Backend --------------------------------------------------------------

backend-shell: ## Open a shell inside the backend container
	$(COMPOSE) run --rm backend bash

rails: ## Run a rails command, e.g. make rails CMD="routes"
	$(RUN_BACKEND) bin/rails $(CMD)

db-create: ## Create development and test databases
	$(RUN_BACKEND) bash -c "bin/rails db:create && RAILS_ENV=test bin/rails db:create"

db-migrate: ## Run database migrations
	$(RUN_BACKEND) bin/rails db:migrate

db-seed: ## Load demo data
	$(RUN_BACKEND) bin/rails db:seed

db-reset: ## Drop, recreate, migrate and seed the database
	$(RUN_BACKEND) bin/rails db:drop db:create db:migrate db:seed

graphql-schema: ## Dump the GraphQL schema to backend/schema.graphql
	$(RUN_BACKEND) bin/rails runner 'File.write("schema.graphql", BackendSchema.to_definition)'

swagger: ## Regenerate the Swagger (OpenAPI) document
	$(RUN_BACKEND) bin/rails rswag:specs:swaggerize

test-backend: ## Run backend RSpec suite
	$(RUN_BACKEND) bundle exec rspec

lint-backend: ## Run RuboCop and Brakeman on the backend
	$(RUN_BACKEND) bash -c "bundle exec rubocop && bundle exec brakeman -q --no-pager"

# --- Frontend -------------------------------------------------------------

frontend-install: ## Install frontend dependencies
	$(RUN_FRONTEND) npm install

test-frontend: ## Run frontend test suite (Vitest)
	$(RUN_FRONTEND) npm test -- --run

lint-frontend: ## Lint and type-check the frontend
	$(RUN_FRONTEND) sh -c "npm run lint && npm run typecheck"

# --- End-to-end -----------------------------------------------------------

test-e2e: setup build ## Run the Playwright E2E suite against the stack (db, backend, frontend)
	$(COMPOSE) up --abort-on-container-exit --exit-code-from e2e e2e

# --- Everything -----------------------------------------------------------

test: test-backend test-frontend ## Run all test suites

lint: lint-backend lint-frontend ## Run all linters

.PHONY: help setup build up down restart logs ps backend-shell rails db-create db-migrate db-seed db-reset graphql-schema swagger test-backend lint-backend frontend-install test-frontend lint-frontend test lint test-e2e
