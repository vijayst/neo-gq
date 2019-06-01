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

axios.get('https://cupshe.com/products.json?page=3').then(response => {
    response.data.products.forEach(product => {
        client
            .mutate({
                mutation: gql(`
                        mutation ($id: ID, $title: String, $handle: String, $body_html: String, $published_at: String, $created_at: String, $updated_at: String, $vendor: String, $product_type: String) {
                            CreateProduct(id: $id, title: $title, handle: $handle, body_html: $body_html, published_at: $published_at, created_at: $created_at, updated_at: $updated_at, vendor: $vendor, product_type: $product_type) {
                                id,
                                title
                            }
                        }
                    `),
                variables: {
                    id: product.id,
                    title: product.title,
                    handle: product.handle,
                    body_html: product.body_html,
                    published_at: product.published_at,
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                    vendor: product.vendor,
                    product_type: product.product_type
                }
            })
            .then(data => console.log(data))
            .catch(error => console.error(error));
    });
});
