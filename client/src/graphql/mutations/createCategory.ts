import { graphql } from "../../gql";


export const CREATE_CATEGORY = graphql(`
    mutation CreateCategory($name: String!, $slug: String!, $description: String, $isAdminOnly: Boolean) {
        createCategory(name: $name, slug: $slug, description: $description, isAdminOnly: $isAdminOnly) {
            id
            name
            slug
            description
            isAdminOnly
        }
    }
`)