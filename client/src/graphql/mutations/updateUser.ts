import { graphql } from "../../gql";


export const UPDATE_USER = graphql(`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
            id
            login
            email
            avatar
        }
    }
`)