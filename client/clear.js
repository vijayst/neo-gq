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
    .query({
        query: gql`
            query {
                Product {
                    id
                }
            }
        `
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
        });
    })
    .catch(error => console.error('Error from product', error.message));

client
    .query({
        query: gql`
            query {
                Variant {
                    id
                }
            }
        `
    })
    .then(result => {
        result.data.Variant.forEach(v => {
            console.log('deleting', v.id);
            client
                .mutate({
                    mutation: gql(`
                            mutation ($id: ID!) {
                                DeleteVariant(id: $id) {
                                    id
                                }
                            }
                        `),
                    variables: {
                        id: v.id
                    }
                })
                .then(data => console.log(data))
                .catch(error => console.error(error));
        });
    })
    .catch(error => console.error('Error from image', error.message));

client
    .query({
        query: gql`
            query {
                Image {
                    id
                }
            }
        `
    })
    .then(result => {
        result.data.Image.forEach(i => {
            console.log('deleting', i.id);
            client
                .mutate({
                    mutation: gql(`
                            mutation ($id: ID!) {
                                DeleteImage(id: $id) {
                                    id
                                }
                            }
                        `),
                    variables: {
                        id: i.id
                    }
                })
                .then(data => console.log(data))
                .catch(error => console.error(error));
        });
    })
    .catch(error => console.error('Error from image', error.message));

client
    .query({
        query: gql`
            query {
                Option {
                    id
                }
            }
        `
    })
    .then(result => {
        result.data.Option.forEach(o => {
            if (o.id) {
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
                    .catch(error =>
                        console.error('Error from option', error.message)
                    );
            }
        });
    })
    .catch(error => console.error(error));
