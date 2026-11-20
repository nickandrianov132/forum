import { graphql } from "../../gql";


export const ADD_COMMENT_LIKE = graphql(`
    mutation AddCommentLike($commentId: ID!) {
        addCommentLike(commentId: $commentId) {
            id
            likesCount
            dislikesCount
            isLiked
            isDisliked
        }
    }
`)