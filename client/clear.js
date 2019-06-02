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

client.query({
    query: gql`
      query {
        Product {
          id
        }
      }
    `,
  })
    .then(result => {
        result.data.Product.forEach(p => {
            console.log('deleting', p.id);
            client
            .mutate({
                mutation: gql(`
                        mutation ($id: ID!) {
                            DeleteProduct(id: $id) {
                                id
                            }
                        }
                    `),
                variables: {
                    id: p.id
                }
            })
            .then(data => console.log(data))
            .catch(error => console.error(error));
        })
    })
    .catch(error => console.error(error));

    client.query({
        query: gql`
          query {
            Option {
              id
            }
          }
        `,
      })
        .then(result => {
            result.data.Option.forEach(o => {
                console.log('deleting', o.id);
                client
                .mutate({
                    mutation: gql(`
                            mutation ($id: ID!) {
                                DeleteOption(id: $id) {
                                    id
                                }
                            }
                        `),
                    variables: {
                        id: o.id
                    }
                })
                .then(data => console.log(data))
                .catch(error => console.error(error));
            })
        })
        .catch(error => console.error(error));