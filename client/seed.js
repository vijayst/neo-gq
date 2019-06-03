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
    const products = response.data.products;
    products.forEach(product => {
        client
            .mutate({
                mutation: gql(`
                        mutation ($id: ID, $title: String, $handle: String, $body_html: String, $published_at: _Neo4jDateTimeInput, $created_at: _Neo4jDateTimeInput, $updated_at: _Neo4jDateTimeInput, $vendor: String, $product_type: String, $tags: String) {
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
                    tags: `,${product.tags.join(',')},`
                }
            })
            .then(() => {
                const promises = [];
                product.variants.forEach(variant => {
                    const promise = client
                        .mutate({
                            mutation: gql(`
                                mutation ($id: ID, $title: String, $option1: String, $option1s: String, $option2: String, $option3: String, $sku: String, $requires_shipping: Boolean, $taxable: Boolean, $available: Boolean, $price: Float, $grams: Int, $compare_at_price: Float, $position: Int, $created_at: _Neo4jDateTimeInput, $updated_at: _Neo4jDateTimeInput) {
                                    CreateVariant(id: $id, title: $title, option1: $option1, option1s: $option1s, option2: $option2, option3: $option3, sku: $sku, requires_shipping: $requires_shipping, taxable: $taxable, available: $available, price: $price, grams: $grams, compare_at_price: $compare_at_price, position: $position, created_at: $created_at, updated_at: $updated_at) {
                                        id
                                    }
                                }
                            `),
                            variables: {
                                id: variant.id.toString(),
                                title: variant.title,
                                option1: variant.option1,
                                option1s: variant.option1.toLowerCase(),
                                option2: variant.option2,
                                option3: variant.option3,
                                sku: variant.sku,
                                requires_shipping: variant.requires_shipping,
                                taxable: variant.taxable,
                                available: variant.available,
                                price: parseFloat(variant.price),
                                grams: variant.grams,
                                compare_at_price: parseFloat(variant.compare_at_price),
                                position: variant.position,
                                created_at: { formatted: variant.created_at },
                                updated_at: { formatted: variant.updated_at }
                            }
                        })
                        .then(() => {
                            return client.mutate({
                                mutation: gql(`
                                mutation ($from: ID!, $to: ID!) {
                                    AddProductVariants(from: { id: $from }, to: { id: $to }) {
                                        from {
                                            id
                                        }
                                    }
                                }
                            `),
                                variables: {
                                    from: product.id.toString(),
                                    to: variant.id.toString()
                                }
                            });
                        });
                    promises.push(promise);
                });
                return Promise.all(promises);
            })
            .then(() => {
                const promises = [];
                product.images.forEach(image => {
                    const promise = client
                        .mutate({
                            mutation: gql(`
                                mutation ($id: ID, $created_at: _Neo4jDateTimeInput, $position: Int, $updated_at: _Neo4jDateTimeInput, $src: String, $width: Int, $height: Int) {
                                    CreateImage(id: $id, created_at: $created_at, position: $position, updated_at: $updated_at, src: $src, width: $width, height: $height) {
                                        id
                                    }
                                }
                            `),
                            variables: {
                                id: image.id.toString(),
                                created_at: { formatted: product.created_at },
                                position: product.position,
                                updated_at: { formatted: product.updated_at },
                                src: product.src,
                                width: product.width,
                                height: product.height
                            }
                        })
                        .then(() => {
                            return client.mutate({
                                mutation: gql(`
                                mutation ($from: ID!, $to: ID!) {
                                    AddProductImages(from: { id: $from }, to: { id: $to }) {
                                        from {
                                            id
                                        }
                                    }
                                }
                            `),
                                variables: {
                                    from: product.id.toString(),
                                    to: image.id.toString()
                                }
                            });
                        })
                        .then(() => {
                            if (image.variant_ids.length) {
                                const promises = [];
                                image.variant_ids.forEach(imageVariantId => {
                                    const promise = client.mutate({
                                        mutation: gql(`
                                        mutation ($from: ID!, $to: ID!) {
                                            AddImageVariants(from: { id: $from }, to: { id: $to }) {
                                                from {
                                                    id
                                                }
                                            }
                                        }
                                    `),
                                        variables: {
                                            from: imageVariantId.toString(),
                                            to: image.id.toString()
                                        }
                                    });
                                    promises.push(promise);
                                });
                                return Promise.all(promises);
                            }
                        });
                    promises.push(promise);
                });
                return Promise.all(promises);
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
