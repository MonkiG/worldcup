SHELL := /bin/sh

WEB_DIR := web
DATA_FILE ?= data/latest.json

.DEFAULT_GOAL := help

.PHONY: help install scrape scrape-from test front front-build front-start front-check check

help: ## Show the available commands
	@awk 'BEGIN {FS = ":.*## "; printf "\nWorld Cup commands:\n\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@printf "\n"

install: ## Install the Next.js dependencies
	npm --prefix $(WEB_DIR) install

scrape: ## Scrape FIFA and write DATA_FILE (default: data/latest.json)
	npm --prefix $(WEB_DIR) run scrape -- --output ../$(DATA_FILE)

scrape-from: ## Parse saved HTML: make scrape-from HTML=path/to/file.html
	@test -n "$(HTML)" || (echo "Usage: make scrape-from HTML=path/to/file.html" >&2; exit 2)
	npm --prefix $(WEB_DIR) run scrape -- --input ../$(HTML) --output ../$(DATA_FILE)

test: ## Run the Node scraper tests
	npm --prefix $(WEB_DIR) run test:scraper

front: ## Start the Next.js development server
	npm --prefix $(WEB_DIR) run dev

front-build: ## Create the production Next.js build
	npm --prefix $(WEB_DIR) run build

front-start: ## Start the production Next.js server
	npm --prefix $(WEB_DIR) run start

front-check: ## Run the frontend TypeScript check
	npm --prefix $(WEB_DIR) run check

check: test front-check front-build ## Run all tests and build the frontend
