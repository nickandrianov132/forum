import { gql } from '@apollo/client';

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $postTitle: String, $postContent: String) {
    updatePost(id: $id, title: $postTitle, content: $postContent) {
      id
      title
      content
      likesCount
      dislikesCount
      isLiked
      isDisliked
    }
  }
`;
