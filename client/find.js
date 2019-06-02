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

const query = gql`query ($size: String! = "XS") {
    Product(
      filter: {
        variants_some: { AND: [{ option1: $size }, { available: true }] }
      }
    ) {
      title
    }
  }
  `;

  client
    .query({
        query
    })
    .then(result => {
        result.data.Product.forEach(p => {
            console.log(p.title);
        });
    });