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

if (process.argv.length < 3) {
    console.log('Usage is yarn delete <handle>. Product handle is mandatory.');
    process.exit(0);
}

const handle = process.argv[2];

const query = gql`
    query($handle: String) {
        Product(handle: $handle) {
            id
            variants {
                id
            }
            images {
                id
            }
            options {
                id
            }
        }
    }
`;

const deleteProductMutation = gql`
    mutation($id: ID!) {
        DeleteProduct(id: $id) {
            id
        }
    }
`;

const deleteVariantMutation = gql`
    mutation($id: ID!) {
        DeleteVariant(id: $id) {
            id
        }
    }
`;

const deleteImageMutation = gql`
    mutation($id: ID!) {
        DeleteImage(id: $id) {
            id
        }
    }
`;

const deleteOptionMutation = gql`
    mutation($id: ID!) {
        DeleteOption(id: $id) {
            id
        }
    }
`;

client
    .query({
        query,
        variables: {
            handle
        }
    })
    .then(result => {
        if (result.data.Product.length === 0) {
            console.log('No product was deleted. Probably wrong handle');
        }
        const product = result.data.Product[0];
        const promises = [];
        
        const deleteProductPromise = client.mutate({
            mutation: deleteProductMutation,
            variables: { 
                id: product.id
            }
        });
        promises.push(deleteProductPromise);

        product.variants.forEach(variant => {
            const deleteVariantPromise = client.mutate({
                mutation: deleteVariantMutation,
                variables: {
                    id: variant.id
                }
            });
            promises.push(deleteVariantPromise);
        });

        product.images.forEach(image => {
            const deleteImagePromise = client.mutate({
                mutation: deleteImageMutation,
                variables: {
                    id: image.id
                }
            });
            promises.push(deleteImagePromise);
        });

        product.options.forEach(option => {
            const deleteOptionPromise = client.mutate({
                mutation: deleteOptionMutation,
                variables: {
                    id: option.id
                }
            });
            promises.push(deleteOptionPromise);
        });

        return Promise.all(promises);
    })
    .then(() => {
        console.log('Product with handle', handle, 'is deleted');
    })
    .catch(error => {
        console.log(error.message);
    });
