import { graphql } from "../../gql";


export const DELETE_MESSAGE = graphql(`
    mutation DeleteMessage($id: ID!) {
        deleteMessage(id: $id) {
            id
        }
    }    
`)