import { typeDefs } from './schema';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { v1 as neo4j } from 'neo4j-driver';
import { makeAugmentedSchema } from 'neo4j-graphql-js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const schema = makeAugmentedSchema({
    typeDefs
});

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const server = new ApolloServer({
    context: { driver },
    schema,
    introspection: true,
    playground: true
});

const path = '/graphql';
server.applyMiddleware({ app, path });

const port = process.env.GRAPHQL_LISTEN_PORT || 4001;
app.listen({ port, path }, () => {
    console.log(`GraphQL server ready at http://localhost:${port}${path}`);
});
