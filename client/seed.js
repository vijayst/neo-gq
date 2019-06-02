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

let optionIndex = 1;

axios.get('https://cupshe.com/products.json?page=3').then(response => {
    const products = response.data.products.slice(0, 1);
    products.forEach(product => {
        client
            .mutate({
                mutation: gql(`
                        mutation ($id: ID, $title: String, $handle: String, $body_html: String, $published_at: _Neo4jDateTimeInput, $created_at: _Neo4jDateTimeInput, $updated_at: _Neo4jDateTimeInput, $vendor: String, $product_type: String, $tags: [String]) {
                            CreateProduct(id: $id, title: $title, handle: $handle, body_html: $body_html, published_at: $published_at, created_at: $created_at, updated_at: $updated_at, vendor: $vendor, product_type: $product_type, tags: $tags) {
                                id,
                                title
                            }
                        }
                    `),
                variables: {
                    id: product.id.toString(),
                    title: product.title,
                    handle: product.handle,
                    body_html: product.body_html,
                    published_at: { formatted: product.published_at },
                    created_at: { formatted: product.created_at },
                    updated_at: { formatted: product.updated_at },
                    vendor: product.vendor,
                    product_type: product.product_type,
                    tags: product.tags
                }
            })
            .then(() => {
                const promises = [];
                product.options.forEach(option => {
                    option.id = (optionIndex++).toString();
                    const promise = client
                        .mutate({
                            mutation: gql(`
                                mutation ($id: ID, $name: String, $position: Int, $values: [String]) {
                                    CreateOption(id: $id, name: $name, position: $position, values: $values) {
                                        id
                                    }
                                }
                            `),
                            variables: option
                        })
                        .then(() => {
                            return client.mutate({
                                mutation: gql(`
                                mutation ($from: ID!, $to: ID!) {
                                    AddProductOptions(from: { id: $from }, to: { id: $to }) {
                                        from {
                                            id
                                        }
                                    }
                                }
                            `),
                                variables: {
                                    from: product.id.toString(),
                                    to: option.id
                                }
                            });
                        });
                    promises.push(promise);
                });
                return Promise.all(promises);
            })
            .catch(error => console.error(error));
    });
});
