import { graphql } from "../../gql";


export const MESSAGE_SUBSCRIPTION = graphql(`
    subscription OnMessageAdded {
        messageAdded {
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