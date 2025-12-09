all: eslint build test

build:
	@echo "Building files..."
	@npx tsc -p tsconfig.json

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
	@rm -f *~ src/*~ src/*.js src/*.js.map test/*~ test/*.js test/*.js.map html/*~
	@rm -rf dist/
	@rm -rf coverage/
	@rm -rf .nyc_output/
	@rm -f *.tsbuildinfo
	@rm -f report/*.aux report/*.log report/*.out report/*.toc report/*.synctex.gz report/*.fdb_latexmk report/*.fls report/*.pdf
	@rm -f *.aux *.log *.out *.toc *.synctex.gz *.fdb_latexmk *.fls
	@echo "All generated files cleaned!"

rapport:
	pdflatex report/main.tex
	pdflatex report/main.tex
	mv main.* report/
	evince report/main.pdf&

.PHONY: all archive build clean eslint parcel test run watch rapport
