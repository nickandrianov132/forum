import { graphql } from '../../gql';

export const GET_CATEGORY_BY_SLUG = graphql(`
    query GetCategoryBySlug($slug: String!) {
      categoryBySlug(slug: $slug) {
        id
        name
        description
      }
    }  
`)

export const GET_POSTS_BY_CATEGORY = graphql(`
    query GetPostsByCategory($slug: String!, $limit: Int!, $offset: Int!) {
      postsByCategory(slug: $slug, limit: $limit, offset: $offset) {
        totalCount
        posts {
         id
         title
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
         }
        }
      }
    }  
`)

