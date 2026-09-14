import { graphql } from "../../gql"

export const GET_CATEGORIES = graphql(`
    query GetCategories {
        categories {
            id
            name
            slug
        }
    }
`)