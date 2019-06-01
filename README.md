References:
* [Setup Nodemon with Babel7](https://www.codementor.io/michaelumanah/how-to-set-up-babel-7-and-nodemon-with-node-js-pbj7cietc)
* [Neo4J / GraphQL guide](https://neo4j.com/developer/graphql/)
* [Grand Stack Starter Project](https://grandstack.io/docs/getting-started-grand-stack-starter.html)

How to Run:
### Server folder 
contains everything to run the Apollo GraphQL server on neo4j
* yarn database runs Neo4J
* yarn start runs the GraphQL server

### Client folder 
contains code to seed, query, mutate, export database using Apollo client
* yarn seed creates all products from the api
* yarn clear removes all the products in the DB