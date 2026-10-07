import { graphql } from "../../gql";


export const CREATE_POST = graphql(`
   mutation CreatePost($categoryId: ID!, $title: String!, $content: String!, $userId: ID!) {
      createPost(categoryId: $categoryId, title: $title, content: $content, userId: $userId) {
        id
        category {
            id
            name
        }
        title
        createdAt
        user{
            id
            login
        }
      }
   }
`);