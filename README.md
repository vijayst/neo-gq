## Server folder

contains everything to run the Apollo GraphQL server on neo4j

-   **npm run database** creates new Neo4J in docker container and starts it
-   **docker start neo4j** starts the docker container (after stopping it)
-   **npm start** runs the GraphQL server

### Starting the Neo4J database (server folder)

For creating the neo4j database for the first time, use `npm run database` on the server folder. This command automatically starts the container. 

```
cd server
npm install
npm run database
```

In case you stop the container, start the `neo4j` container by running `docker start neo4j`. 

### Starting the GraphQL server (server folder)

`npm start` on the server folder starts the GraphQL server. Keep it running. 

```
cd server
npm start
```

The GraphQL data can viewed using `http://localhost:4001/graphql`. The tool has DOCS for writing queries and mutations.

### Running Cipher queries

To open a interactive docker shell, use the following command (where neo4j is the name of the container). User name is neo4j and password is test.

```
docker exec --interactive --tty neo4j bin/cypher-shell
```

Type `:exit` to exit the shell. `server/database.cql` has all the CQL queries that you can run. Run those queries in the interactive terminal.


## Client folder

contains code to seed, query, mutate, export database using Apollo client

Keep the server running in a separate terminal window. And create a new terminal window where the following client commands are run.

```
cd client
npm install
npm run seed
```

-   **npm run seed** creates all products from the api
-   **npm run find** queries for products matching tag, size
-   **npm run update** toggles the availability of a variant
-   **npm run delete** deletes product by handle
-   **npm run export** exports data from neo4j and compares it with data from api
-   **npm run clear** clears all data in neo4j database

### Syntax for find

```
npm run find <tag> <size>
```

To supply only size, type null for tag. Size is case-insensitive, use XS or xs. Tag is case sensitive. For example, use "Style_Removable Padded" for tag in argument. Enclose the tag with single or double quote. `npm run find "Style_Removable Padded"` or `npm run find null s` or `npm run find null S` or `npm run find "Style_Removable Padded" s` are all valid.

### Syntax for update

```
npm run update <handle> <size>
```

Argument _handle_ is the product handle. Argument _size_ is the variant size (option1s). Both arguments are mandatory.
For example, `npm run update pure-eyes-falbala-bikini-top s`

## Syntax for delete

```
npm run delete <handle>
```

Argument _handle_ is the product handle is mandatory. For example, `npm run delete pure-eyes-falbala-bikini-top`

## Syntax for export

```
npm run export
```

This exports data from neo4j database and compares it with data from api. No major differences were found. The only minor difference was date formatting. But there is no loss in data over there. In some places, date from API is formatted as "2019-05-28T06:00:55+00:00". The exported date is "2019-05-28T06:00:55Z" with no loss in precision. Both are UTC times with slightly different formatting.

## Additional notes

### Searching on array of strings

Searching on array of strings is not possible with neo4j-graphql-js built-in filters. So, I converted the array of strings
into a comma separated string. Using the following filter works: `{ tags_contains: $tag }`, where \$tag is prefixed and suffixed with commas. An example is found in find.js. Note that the separator for tags can be any set of arbitrary string, not necessarily a comma.

### Case-insensitive search

To perform case-insensitive search, another field should be created in GraphQL Schema which are all lowercase characters. For eg, if option1 is the field on which you want to perform case-insensitive search, create a shadow field, `option1s` which has the same string in lowercase. Take the input string and convert it to lowercase, and do a search on `option1s` instead of `option1`. An example is found in find.js. This becomes painful if you want it to be a general feature in your app.

### Unique constraints

ID in GraphQL Schema does not enforce unique constraints in Neo4J database. Please create a unique constraint using Cipher Query on Neo4J database wherever applicable.

```
CREATE CONSTRAINT ON (product:Product) ASSERT product.id IS UNIQUE;
```

Similar CQL queries exist for indexes.

### Deleting a node using CQL vs DeleteXXX mutation

Deleting a node using CQL does not always work.

```
MATCH(p:Product { id: "1826623357018" }) DELETE p;
```

The above delete statement gives the following error:
_Cannot delete node<4689>, because it still has relationships. To delete this node, you must first delete its relationships._

However, the `DeleteProduct` mutation from the augmented schema not only deletes the product but drops all the relations. That is how `npm run clear` command on the client folder deletes the entire database by performing DeleteXXX mutations.

## References

-   [Setup Nodemon with Babel7](https://www.codementor.io/michaelumanah/how-to-set-up-babel-7-and-nodemon-with-node-js-pbj7cietc)
-   [Neo4J / GraphQL guide](https://neo4j.com/developer/graphql/)
-   [Grand Stack Starter Project](https://grandstack.io/docs/getting-started-grand-stack-starter.html)
-   [Constraints in neo4j](https://neo4j.com/docs/cypher-manual/current/schema/constraints/)
-   [Filtering with neo4j-graphql-js](https://grandstack.io/docs/graphql-filtering.html)
-   [Docker operations on neo4j](https://neo4j.com/docs/operations-manual/current/docker/operations/)
