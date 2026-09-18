.PHONY: help env db-up db-down db-reset db-migrate dev

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

env: ## Create .env from .env.example if it does not exist
	@test -f .env || cp .env.example .env

db-up: ## Start Postgres in Docker and wait until it is healthy
	docker compose up -d --wait db

db-down: ## Stop Postgres (data is kept in the pgdata volume)
	docker compose down

db-reset: ## Stop Postgres and delete all data
	docker compose down -v

db-migrate: env db-up ## Apply pending Prisma migrations (creates one from schema changes in dev)
	npx prisma migrate dev

dev: env db-up ## Start Postgres and the Next.js dev server
	npm run dev
