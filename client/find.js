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
if (process.argv.length >= 3) {
    tag = `,${process.argv[2]},`;
} else {
    console.log(
        'yarn find <tag> <size>: Provide a tag and/or size. If you want to provide size, provide null for tag'
    );
    process.exit(0);
}

let size;
if (process.argv.length === 4) {
    size = process.argv[3].toLowerCase();
    if (tag === ',null,') {
        tag = undefined;
    }
}

let query;
if (size && tag) {
    query = gql`
        query($tag: String!, $size: String!) {
            Product(
                filter: {
                    AND: [
                        { tags_contains: $tag }
                        {
                            variants_some: {
                                AND: [{ option1s: $size }, { available: true }]
                            }
                        }
                    ]
                }
            ) {
                title
            }
        }
    `;
} else if (tag) {
    query = gql`
        query($tag: String!) {
            Product(filter: { tags_contains: $tag }) {
                title
            }
        }
    `;
} else if (size) {
    query = gql`
        query($size: String!) {
            Product(
                filter: {
                    variants_some: {
                        AND: [{ option1s: $size }, { available: true }]
                    }
                }
            ) {
                title
            }
        }
    `;
}

const hrStart = process.hrtime();

client
    .query({
        query,
        variables: {
            tag,
            size
        }
    })
    .then(result => {
        const hrEnd = process.hrtime(hrStart);
        console.log('Query executed in %d ms', hrEnd[1]/1000000);
        
        result.data.Product.forEach(p => {
            console.log(p.title);
        });
        console.log(
            'found',
            result.data.Product.length,
            'items with tag: ',
            tag,
            'and size: ',
            size
        );
    });
