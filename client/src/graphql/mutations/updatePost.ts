import { gql } from '@apollo/client';

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $postTitle: String, $postContent: String) {
    updatePost(id: $id, title: $postTitle, content: $postContent) {
      id              # Обязательно для идентификации в кэше
      title           # Чтобы заголовок обновился в списке
      content         # Чтобы контент обновился в списке
      likesCount
      dislikesCount
      isLiked
      isDisliked
      __typename      # Помогает Apollo понять тип объекта
      isOwner
    }
  }
`;
