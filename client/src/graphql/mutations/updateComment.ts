import { graphql } from "../../gql";


export const UPDATE_COMMENT = graphql(`
    mutation UpdateComment($id: ID!, $content: String!) {
        updateComment(id: $id, content: $content) {
            id
            content
            ...CommentFields
        }
    }    
`)