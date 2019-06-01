import axios from 'axios';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

dotenv.config();

const client = new ApolloClient({
    link: new HttpLink({ uri: process.env.GRAPHQL_URI, fetch }),
    cache: new InMemoryCache()
});

client
    .mutate({
        mutation: gql(seedmutations)
    })
    .then(data => console.log(data))
    .catch(error => console.error(error));

export function seed() {
    axios.get('https://cupshe.com/products.json?page=3').then(response => {
        response.data.products.forEach((product, index) => {
            console.log(index, product.title);
        });
    });
}
