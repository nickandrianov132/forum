import { graphql } from "../../gql";

export const GET_MESSAGES = graphql(`
    query GetMessages {
        messages {
            id
            text
            userId
            createdAt
            user {
                id
                login
                avatar
            }
        }
    }    
`);