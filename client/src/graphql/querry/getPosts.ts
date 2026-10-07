import { graphql } from '../../gql';

export const GET_POSTS = graphql(`
    query getPosts($limit: Int!, $offset: Int!) {
        posts(limit: $limit, offset: $offset) {
            totalCount
            posts {
                id
                title
                content
                isDisliked
                isLiked
                likesCount
                dislikesCount
                isOwner
                user {
                    id
                    login
                }
            }
        }
    }
`)
