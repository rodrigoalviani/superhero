# SuperHero Catalogue REST API

## Environment
Developed and tested on MacOSX 10.12.3, MongoDB 3.4.2, Node 7.7.3

Documentation found at ./doc

Postman collection found at ./test/Superhero.postman_collection.json

## Instalation
```
git clone git@github.com:rodrigoalviani/superhero.git
cd superhero
npm i
npm i mocha -g	# to tests
npm i istanbul -g	# to coverage
npm i apidoc -g	# to build a doc
node fixtures/createAdmin.js	# to create a new admin user
```

## Running tests
`npm test`

## Running coverage report
`npm run coverage`

## Build doc
`npm run doc`

## Running application
`npm start`