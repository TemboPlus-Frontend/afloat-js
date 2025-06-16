# Makefile for publishing @temboplus/afloat to npm

# Default version if not specified
VERSION ?= 0.1.34

.PHONY: help build-npm publish-npm clean check-version check-login full-publish

help:
	@echo "Available commands:"
	@echo "  make build-npm VERSION=x.y.z   - Build npm package with specified version"
	@echo "  make publish-npm               - Publish the built package to npm"
	@echo "  make full-publish VERSION=x.y.z - Build and publish in one step"
	@echo "  make clean                     - Remove the npm build directory"
	@echo "  make help                      - Show this help message"

# Check if the version is valid
check-version:
	@echo "Checking version format..."
	@if ! echo "$(VERSION)" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$$' > /dev/null; then \
		echo "Error: Version must be in format x.y.z (e.g., 1.2.3)"; \
		exit 1; \
	fi
	@echo "Version format is valid: $(VERSION)"

# Check if user is logged in to npm
check-login:
	@echo "Checking npm login status..."
	@if ! npm whoami >/dev/null 2>&1; then \
		echo "Error: You are not logged in to npm. Please run 'npm login' first."; \
		exit 1; \
	fi
	@echo "You are logged in to npm as $$(npm whoami)"

# Build the npm package
build-npm: check-version
	@echo "Building npm package version $(VERSION)..."
	deno run -A scripts/build_npm.ts $(VERSION)
	@echo "Build completed. Package is in the 'npm' directory."

# Publish to npm
publish-npm: check-login
	@echo "Publishing package to npm..."
	cd npm && npm publish --access=public
	@echo "Package published successfully!"

# Clean the npm directory
clean:
	@echo "Cleaning npm build directory..."
	rm -rf npm
	@echo "Clean completed."

# Build and publish in one step
publish: check-version check-login build-npm publish-npm
	@echo "Full publish process completed successfully!"