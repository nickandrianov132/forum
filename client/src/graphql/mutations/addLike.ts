import { gql } from '@apollo/client';

export const ADD_LIKE = gql`
  mutation AddLike($postId: ID!) {
    addLike(postId: $postId) {
      id
      likesCount
      dislikesCount
      isLiked
      isDisliked
    }
  }
`;
