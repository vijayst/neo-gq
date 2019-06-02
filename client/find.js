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

let tag;
if (process.argv.length > 3) {
    tag = `,${process.argv[2]},`;
}

let size;
if (process.argv.length === 4) {
    size = process.argv[3];
    if (tag === ',null,') {
        tag = undefined;
    }
}

const query = gql`query($tag: String! = ",new arrivals,", $size: String! = "XS") {
    Product(
      filter: {
        AND: [
          { tags_contains: $tag }
          { variants_some: { AND: [{ option1: $size }, { available: true }] } }
        ]
      }
    ) {
      title
    }
  }
  `;

  client
    .query({
        query,
        variables: {
            tag,
            size
        }
    })
    .then(result => {
        result.data.Product.forEach(p => {
            console.log(p.title);
        });
        console.log('found', result.data.Product.length, 'items with tag: ', tag, 'and size: ', size);
    });