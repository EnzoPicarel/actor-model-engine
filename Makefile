all: eslint build test

build:
	@echo "Building files..."
	@npx tsc -p tsconfig.json
	@npx tsc src/actor.ts
	@npx tsc src/world.ts

eslint:
	@echo "Running ESLint..."
	@npx eslint -c eslint.config.js

test:
	@echo "Running tests..."
	@NODE_OPTIONS="$$NODE_OPTIONS --experimental-vm-modules" npx jest -c jest.config.ts

run:
	@echo "Running the script..."
	@npx tsc
	@node dist/src/world.js

watch:
	@npx tsc -w -p tsconfig.json

clean:
	@echo "Cleaning up..."
	@rm -f *~ src/*~ src/*.js test/*~ html/*~
	@rm -rf dist/*

rapport:
	pdflatex report/main.tex
	pdflatex report/main.tex
	mv main.* report/
	evince report/main.pdf&

.PHONY: all archive build clean eslint parcel test run watch rapport
