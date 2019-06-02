### References
* [Setup Nodemon with Babel7](https://www.codementor.io/michaelumanah/how-to-set-up-babel-7-and-nodemon-with-node-js-pbj7cietc)
* [Neo4J / GraphQL guide](https://neo4j.com/developer/graphql/)
* [Grand Stack Starter Project](https://grandstack.io/docs/getting-started-grand-stack-starter.html)

### Server folder 
contains everything to run the Apollo GraphQL server on neo4j
* yarn database creates new Neo4J in docker container
* docker start neo4j starts the docker container
* yarn start runs the GraphQL server

### Client folder 
contains code to seed, query, mutate, export database using Apollo client
* **yarn seed** creates all products from the api
* **yarn clear** removes all the products in the DB
* **yarn find** queries for products matching tag, size

### Difficulties
* [Enforcing unique constraints](https://stackoverflow.com/questions/56415973/how-can-there-be-multiple-graphql-nodes-with-the-same-id)
* [Case insensitive search is not possible with neo4j-graphql-js filter](https://grandstack.io/docs/graphql-filtering.html)