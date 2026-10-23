import { graphql } from "../../gql";


export const CREATE_CATEGORY = graphql(`
    mutation CreateCategory($name: String!, $slug: String!, $description: String) {
        createCategory(name: $name, slug: $slug, description: $description) {
            id
            name
            slug
            description
        }
    }
`)