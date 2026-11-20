import { graphql } from "../../gql";


export const ADD_COMMENT_DISLIKE = graphql(`
    mutation AddCommentDislike($commentId: ID!) {
        addCommentDislike(commentId: $commentId) {
            id
            likesCount
            dislikesCount
            isLiked
            isDisliked
        }
    }    
`)