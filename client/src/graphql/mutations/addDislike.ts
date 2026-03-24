import { gql } from '@apollo/client';

export const ADD_DISLIKE = gql`
  mutation AddDislike($postId: ID!) {
    addDislike(postId: $postId) {
      id
      likesCount
      dislikesCount
      isLiked
      isDisliked
    }
  }
`;