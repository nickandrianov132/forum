import { graphql } from "../../gql";


export const DELETE_COMMENT = graphql(`
    mutation DeleteComment($id: ID!) {
        deleteComment(id: $id) 
    }
`)