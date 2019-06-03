## Server folder

contains everything to run the Apollo GraphQL server on neo4j

-   **yarn database** creates new Neo4J in docker container and starts it
-   **docker start neo4j** starts the docker container (after stopping it)
-   **yarn start** runs the GraphQL server

## Client folder

contains code to seed, query, mutate, export database using Apollo client

-   **yarn seed** creates all products from the api
-   **yarn find** queries for products matching tag, size
-   **yarn update** toggles the availability of a variant

## Starting the Neo4J database (server folder)

For creating the neo4j database for the first time, use `yarn database` on the server folder. This command automatically starts the container. In case you stop it, start the `neo4j` container by running `docker start neo4j`. To open a interactive docker shell, use the following command (where neo4j is the name of the container). User name is neo4j and password is test.

```
docker exec --interactive --tty neo4j bin/cypher-shell
```

Type `:exit` to exit the shell. `server/database.cql` has all the CQL queries that you can run.

## Starting the GraphQL server (server folder)

`yarn start` on the server folder starts the GraphQL server. Keep it running. Run all the client commands in a separate terminal window.

The GraphQL data can viewed using `http://localhost:4001/graphql`. The tool has
DOCS for writing queries and mutations.

`yarn seed` gets data from an API and pushes it to the neo4j database. Once seeded, use the GraphQL tool to query and mutate.

## Syntax for yarn find (client folder)

```
yarn find <tag> <size>
```

To supply only size, type null for tag. Size is case-insensitive, use XS or xs. Tag is case sensitive. For example, use "Style_Removable Padded" for tag in argument. Enclose the tag with single or double quote. `yarn find "Style_Removable Padded"` or `yarn find null s` or `yarn find null S` or `yarn find "Style_Removable Padded" s` are all valid.

## Syntax for yarn update (client folder)

```
yarn update <handle> <size>
```

Argument _handle_ is the product handle. Argument _size_ is the variant size (option1s). Both arguments are mandatory.
For example, `yarn update pure-eyes-falbala-bikini-top s`

## Syntax for yarn delete (client folder)

```
yarn delete <handle>
```

Argument _handle_ is the product handle is mandatory. For example, `yarn delete pure-eyes-falbala-bikini-top`

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

However, the `DeleteProduct` mutation from the augmented schema not only deletes the product but drops all the relations. That is how `yarn clear` command on the client folder deletes the entire database by performing DeleteXXX mutations.


## References

-   [Setup Nodemon with Babel7](https://www.codementor.io/michaelumanah/how-to-set-up-babel-7-and-nodemon-with-node-js-pbj7cietc)
-   [Neo4J / GraphQL guide](https://neo4j.com/developer/graphql/)
-   [Grand Stack Starter Project](https://grandstack.io/docs/getting-started-grand-stack-starter.html)
-   [Constraints in neo4j](https://neo4j.com/docs/cypher-manual/current/schema/constraints/)
-   [Filtering with neo4j-graphql-js](https://grandstack.io/docs/graphql-filtering.html)
-   [Docker operations on neo4j](https://neo4j.com/docs/operations-manual/current/docker/operations/)

