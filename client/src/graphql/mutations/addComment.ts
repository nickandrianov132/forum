import { graphql } from "../../gql";


export const COMMENT_FIELDS_FRAGMENT = graphql(`
  fragment CommentFields on Comment {
    id
    content
    createdAt
    likesCount
    dislikesCount
    isLiked
    isDisliked
    isOwner
    user {
      id
      login
      avatar
      role
    }
  }
`);

export const ADD_COMMENT = graphql(`
    mutation CreateComment($postId: ID!, $content: String!) {
        createComment(postId: $postId, content: $content) {
            ...CommentFields
        }
    } 
`)

