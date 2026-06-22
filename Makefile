SHELL := /bin/sh

SCRAPER_DIR := scraper
WEB_DIR := web
.DEFAULT_GOAL := help

.PHONY: help install scrape scrape-groups scrape-fixtures scrape-all test front front-build front-start front-check check

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "; printf "\nWorld Cup commands:\n\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@printf "\n"

install: ## Install the project dependencies
	npm --prefix $(WEB_DIR) install
	npm --prefix $(SCRAPER_DIR) install

scrape: scrape-groups ## Scrape FIFA groups and write data/latest.json

scrape-groups: ## Scrape FIFA group standings only
	npm --prefix $(SCRAPER_DIR) run scrape:groups

scrape-fixtures: ## Scrape FIFA fixtures only, keeping existing groups
	npm --prefix $(SCRAPER_DIR) run scrape:fixtures

scrape-all: ## Scrape FIFA groups and fixtures
	npm --prefix $(SCRAPER_DIR) run scrape:all

test: ## Run the Node scraper tests
	npm --prefix $(SCRAPER_DIR) run test

front: ## Start the Next.js development server
	npm --prefix $(WEB_DIR) run dev

front-build: ## Create the production Next.js build
	npm --prefix $(WEB_DIR) run build

front-start: ## Start the production Next.js server
	npm --prefix $(WEB_DIR) run start

front-check: ## Run the frontend TypeScript check
	npm --prefix $(WEB_DIR) run check

check: test front-build front-check ## Run all tests and build the frontend
