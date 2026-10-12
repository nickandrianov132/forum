import { graphql } from "../../gql";


export const SEND_MESSAGE = graphql(`
    mutation SendMessage($text: String!, $userId: ID!) {
        sendMessage(text: $text, userId: $userId) {
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
