import { graphql } from "../../gql";


export const CREATE_POST = graphql(`
   mutation CreatePost($categoryId: ID!, $title: String!, $content: String!) {
      createPost(categoryId: $categoryId, title: $title, content: $content) {
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