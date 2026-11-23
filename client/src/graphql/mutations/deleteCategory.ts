import { graphql } from "../../gql";


export const DELETE_CATEGORY = graphql(`
    mutation DeleteCategory($id: ID!) {
        deleteCategory(id: $id)
    }
`)