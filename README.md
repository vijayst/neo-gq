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

## yarn find
```
yarn find <tag> <size>
``` 
To supply only size, type null for tag. Size is case-insensitive, use XS or xs. Tag is case sensitive. For example, use "Style_Removable Padded"
for tag in argument. Enclose the tag with single or double quote.

### Searching on array of strings
Searching on array of strings is not possible with neo4j-graphql-js built-in filters. So, I converted the array of strings 
into a comma separated string. Using the following filter works: `{ tags_contains: $tag }`, where $tag is prefixed and suffixed with commas.
An example is found in find.js. Note that the separator for tags can be any set of arbitrary string, not necessarily a comma.

### Case-insensitive search
To perform case-insensitive search, another field should be created in GraphQL Schema which are all lowercase characters. For eg, if option1 
is the field on which you want to perform case-insensitive search, create a shadow field, `option1s` which has the same string in lowercase.
Take the input string and convert it to lowercase, and do a search on `option1s` instead of `option1`. An example is found in find.js. This
becomes painful if you want it to be a general feature in your app. 

### Unique constraints
ID in GraphQL Schema does not enforce unique constraints in Neo4J database. Please create an index using Cipher Query on Neo4J 
database wherever applicable. 