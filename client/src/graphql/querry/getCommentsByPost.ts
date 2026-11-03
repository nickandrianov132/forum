import { graphql } from "../../gql";


export const GET_COMMENTS_BY_POST = graphql(`
    query GetCommentsByPost($postId: ID!, $limit: Int!, $offset: Int!) {
        commentsByPost(postId: $postId, limit: $limit, offset: $offset) {
            totalCount
            comments {
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
        }
    }    
`)