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

if (process.argv.length < 4) {
    console.log('Usage is yarn update <handle> <size>. Both product handle and variant size are mandatory.');
    process.exit(0);
}

const handle = process.argv[2];
const size = process.argv[3].toLowerCase();

const query = gql`
query ($handle:String, $size: String) {
    Variant(filter: {
      AND: [{
        option1s: $size
      }, {
        product: {
          handle: $handle
        }
      }]
    }) {
      id
      available
      option1s
      product {
        handle
      }
    }
  }
`;

const mutation = gql`
mutation ($id: ID!, $available: Boolean) {
  UpdateVariant(id: $id, available: $available) {
    id
    available
  }
}
`;

client
    .query({
        query,
        variables: {
            handle,
            size
        }
    })
    .then(result => {
        if (result.data.Variant.length === 0) {
            console.log('Variant could not be found, probably wrong product handle or unknown size');
        } else {
            const variant = result.data.Variant[0];
            console.log('variant id is', variant.id, 'and it is available: ', variant.available);
            return client.mutate({
                mutation,
                variables: {
                    id: variant.id,
                    available: !variant.available
                }
            });
        }
    })
    .then(result => {
        console.log('Availability is set to', result.data.UpdateVariant.available);
    })
    .catch(error => {
        console.log('Something is wrong', error.message);
    });