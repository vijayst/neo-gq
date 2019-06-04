import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import axios from 'axios';
import fs from 'fs';
import { createPatch } from 'rfc6902';

dotenv.config();

const client = new ApolloClient({
    link: new HttpLink({ uri: process.env.GRAPHQL_URI, fetch }),
    cache: new InMemoryCache()
});

const query = gql`
    query {
        Product {
            id
            title
            handle
            body_html
            published_at {
                formatted
            }
            created_at {
                formatted
            }
            updated_at {
                formatted
            }
            vendor
            product_type
            tags
            variants {
                id
                title
                option1
                option2
                option3
                sku
                requires_shipping
                taxable
                available
                price
                grams
                compare_at_price
                position
                created_at {
                    formatted
                }
                updated_at {
                    formatted
                }
                featured_image {
                    id
                    position
                    created_at {
                        formatted
                    }
                    updated_at {
                        formatted
                    }
                    width
                    height
                    src
                    variants {
                        id
                        position
                    }
                }
            }
            images {
                id
                created_at {
                    formatted
                }
                position
                updated_at {
                    formatted
                }
                variants {
                    id
                    position
                }
                src
                width
                height
            }
            options {
                name
                position
                values
            }
        }
    }
`;

client
    .query({
        query
    })
    .then(result => {
        const products = [];
        result.data.Product.forEach(p => {
            const variants = [];
            p.variants.sort((a, b) => a.position - b.position);
            p.variants.forEach(v => {
                const fi = v.featured_image;
                fi.variants.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                const variant = {
                    id: parseInt(v.id),
                    title: v.title,
                    option1: v.option1,
                    option2: v.option2,
                    option3: v.option3,
                    sku: v.sku,
                    requires_shipping: v.requires_shipping,
                    taxable: v.taxable,
                    available: v.available,
                    price: v.price.toFixed(2),
                    product_id: parseInt(p.id),
                    grams: v.grams,
                    compare_at_price:
                        v.compare_at_price && v.compare_at_price.toString(),
                    position: v.position,
                    created_at: v.created_at.formatted,
                    updated_at: v.updated_at.formatted,
                    featured_image: {
                        alt: null,
                        id: parseInt(fi.id),
                        position: fi.position,
                        created_at: fi.created_at.formatted,
                        updated_at: fi.updated_at.formatted,
                        product_id: parseInt(p.id),
                        variant_ids: fi.variants.map(fiv => parseInt(fiv.id)),
                        width: fi.width,
                        height: fi.height,
                        src: fi.src
                    }
                };
                variants.push(variant);
            });

            const images = [];
            p.images.sort((a, b) => a.position - b.position);
            p.images.forEach(i => {
                i.variants.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                const image = {
                    id: parseInt(i.id),
                    created_at: i.created_at.formatted,
                    position: i.position,
                    updated_at: i.updated_at.formatted,
                    product_id: parseInt(p.id),
                    variant_ids: i.variants.map(v => parseInt(v.id)),
                    src: i.src,
                    width: i.width,
                    height: i.height
                };
                images.push(image);
            });

            const options = [];
            p.options.sort((a, b) => a.position - b.position);
            p.options.forEach(o => {
                const option = {
                    name: o.name,
                    position: o.position,
                    values: o.values
                };
                options.push(option);
            });

            const product = {
                id: parseInt(p.id),
                title: p.title,
                handle: p.handle,
                body_html: p.body_html,
                published_at: p.published_at.formatted,
                created_at: p.created_at.formatted,
                updated_at: p.updated_at.formatted,
                vendor: p.vendor,
                product_type: p.product_type,
                tags: p.tags.split(',').filter(s => !!s),
                variants,
                images,
                options
            };
            products.push(product);
        });
        const exportedData = { products };
        console.log('exported all products');

        axios.get('https://cupshe.com/products.json?page=3').then(response => {
            const apiData = response.data;
            apiData.products.forEach((apiProduct, i) => {
                const exportProduct = exportedData.products.find(
                    p => p.id === apiProduct.id
                );
                // fs.writeFile('input.json', JSON.stringify(apiProduct), () => {});
                // fs.writeFile('output.json', JSON.stringify(exportProduct), () => {});
                const patch = createPatch(apiProduct, exportProduct);
                if (patch.length === 0) {
                    console.log('Product from API and Export are equal at', i);
                } else {
                    console.log('patch for', i, patch);
                    console.log('\n\n\n');
                }
            });
        });
    });
