import { graphql } from '../../gql';

export const GET_POSTS_BY_CATEGORY = graphql(`
  query GetPostsByCategory($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      description
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
`);

// export const GET_POSTS_BY_TOPIC = graphql(`
//     query getPostsByTopic($topic: String!) {
//         postsByTopic(topic: $topic) {
//         id
//         topic
//         title
//         content
//         isLiked
//         isDisliked
//         likesCount
//         dislikesCount
//         isOwner
//         user {
//             login
//         }
//     }
// }
// `)