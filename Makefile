SHELL := /bin/sh

WEB_DIR := web
.DEFAULT_GOAL := help

.PHONY: help install scrape scrape-all snapshot front front-build front-start front-check check

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "; printf "\nWorld Cup commands:\n\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@printf "\n"

install: ## Install the project dependencies
	npm --prefix $(WEB_DIR) install

scrape: scrape-all ## Scrape all FIFA source data and rebuild web/data/latest.json

scrape-all: ## Scrape FIFA groups and fixtures
	npm --prefix $(WEB_DIR) run scrape:all

snapshot: ## Rebuild web/data/latest.json from web/data/world-cup-source.json
	npm --prefix $(WEB_DIR) run snapshot

front: ## Start the Next.js development server
	npm --prefix $(WEB_DIR) run dev

front-build: ## Create the production Next.js build
	npm --prefix $(WEB_DIR) run build

front-start: ## Start the production Next.js server
	npm --prefix $(WEB_DIR) run start

front-check: ## Run the frontend TypeScript check
	npm --prefix $(WEB_DIR) run check

check: front-build front-check ## Build and typecheck the frontend
