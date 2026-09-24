/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation AddDislike($postId: ID!) {\n    addDislike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n": typeof types.AddDislikeDocument,
    "\n  mutation AddLike($postId: ID!) {\n    addLike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n": typeof types.AddLikeDocument,
    "\n   mutation CreatePost($categoryId: ID!, $title: String!, $content: String!, $userId: ID!) {\n      createPost(categoryId: $categoryId, title: $title, content: $content, userId: $userId) {\n        id\n        category {\n            id\n            name\n        }\n        title\n        createdAt\n        user{\n            id\n            login\n        }\n      }\n   }\n": typeof types.CreatePostDocument,
    "\n    mutation DeletePost($id: ID!) {\n        deletePost(id: $id) \n            \n    }    \n": typeof types.DeletePostDocument,
    "\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) {\n      accessToken\n      refreshToken\n      user {\n        id\n        login\n        avatar\n      }\n    }\n  }\n": typeof types.LoginUserDocument,
    "\n  mutation UpdatePost($id: ID!, $postTitle: String, $postContent: String) {\n    updatePost(id: $id, title: $postTitle, content: $postContent) {\n      id              # Обязательно для идентификации в кэше\n      title           # Чтобы заголовок обновился в списке\n      content         # Чтобы контент обновился в списке\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n      __typename      # Помогает Apollo понять тип объекта\n      isOwner\n    }\n  }\n": typeof types.UpdatePostDocument,
    "\n    fragment UserHeaderFields on User {\n      id\n      login\n      avatar\n    }  \n": typeof types.UserHeaderFieldsFragmentDoc,
    "\n  query Me {\n    me {\n      ...UserHeaderFields\n    }\n  }\n": typeof types.MeDocument,
    "\n    query GetCategories {\n        categories {\n            id\n            name\n            slug\n        }\n    }\n": typeof types.GetCategoriesDocument,
    "\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            id\n            login\n            avatar\n        }\n    }\n}\n": typeof types.GetOnePostDocument,
    "\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n": typeof types.GetPostsDocument,
    "\n  query GetPostsByCategory($slug: String!) {\n    categoryBySlug(slug: $slug) {\n      id\n      name\n      description\n      posts {\n        id\n        title\n        content\n        createdAt\n        likesCount\n        dislikesCount\n        isLiked\n        isDisliked\n        isOwner\n        user {\n          id\n          login\n        }\n      }\n    }\n  }\n": typeof types.GetPostsByCategoryDocument,
};
const documents: Documents = {
    "\n  mutation AddDislike($postId: ID!) {\n    addDislike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n": types.AddDislikeDocument,
    "\n  mutation AddLike($postId: ID!) {\n    addLike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n": types.AddLikeDocument,
    "\n   mutation CreatePost($categoryId: ID!, $title: String!, $content: String!, $userId: ID!) {\n      createPost(categoryId: $categoryId, title: $title, content: $content, userId: $userId) {\n        id\n        category {\n            id\n            name\n        }\n        title\n        createdAt\n        user{\n            id\n            login\n        }\n      }\n   }\n": types.CreatePostDocument,
    "\n    mutation DeletePost($id: ID!) {\n        deletePost(id: $id) \n            \n    }    \n": types.DeletePostDocument,
    "\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) {\n      accessToken\n      refreshToken\n      user {\n        id\n        login\n        avatar\n      }\n    }\n  }\n": types.LoginUserDocument,
    "\n  mutation UpdatePost($id: ID!, $postTitle: String, $postContent: String) {\n    updatePost(id: $id, title: $postTitle, content: $postContent) {\n      id              # Обязательно для идентификации в кэше\n      title           # Чтобы заголовок обновился в списке\n      content         # Чтобы контент обновился в списке\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n      __typename      # Помогает Apollo понять тип объекта\n      isOwner\n    }\n  }\n": types.UpdatePostDocument,
    "\n    fragment UserHeaderFields on User {\n      id\n      login\n      avatar\n    }  \n": types.UserHeaderFieldsFragmentDoc,
    "\n  query Me {\n    me {\n      ...UserHeaderFields\n    }\n  }\n": types.MeDocument,
    "\n    query GetCategories {\n        categories {\n            id\n            name\n            slug\n        }\n    }\n": types.GetCategoriesDocument,
    "\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            id\n            login\n            avatar\n        }\n    }\n}\n": types.GetOnePostDocument,
    "\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n": types.GetPostsDocument,
    "\n  query GetPostsByCategory($slug: String!) {\n    categoryBySlug(slug: $slug) {\n      id\n      name\n      description\n      posts {\n        id\n        title\n        content\n        createdAt\n        likesCount\n        dislikesCount\n        isLiked\n        isDisliked\n        isOwner\n        user {\n          id\n          login\n        }\n      }\n    }\n  }\n": types.GetPostsByCategoryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddDislike($postId: ID!) {\n    addDislike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n"): (typeof documents)["\n  mutation AddDislike($postId: ID!) {\n    addDislike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddLike($postId: ID!) {\n    addLike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n"): (typeof documents)["\n  mutation AddLike($postId: ID!) {\n    addLike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n   mutation CreatePost($categoryId: ID!, $title: String!, $content: String!, $userId: ID!) {\n      createPost(categoryId: $categoryId, title: $title, content: $content, userId: $userId) {\n        id\n        category {\n            id\n            name\n        }\n        title\n        createdAt\n        user{\n            id\n            login\n        }\n      }\n   }\n"): (typeof documents)["\n   mutation CreatePost($categoryId: ID!, $title: String!, $content: String!, $userId: ID!) {\n      createPost(categoryId: $categoryId, title: $title, content: $content, userId: $userId) {\n        id\n        category {\n            id\n            name\n        }\n        title\n        createdAt\n        user{\n            id\n            login\n        }\n      }\n   }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation DeletePost($id: ID!) {\n        deletePost(id: $id) \n            \n    }    \n"): (typeof documents)["\n    mutation DeletePost($id: ID!) {\n        deletePost(id: $id) \n            \n    }    \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) {\n      accessToken\n      refreshToken\n      user {\n        id\n        login\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) {\n      accessToken\n      refreshToken\n      user {\n        id\n        login\n        avatar\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePost($id: ID!, $postTitle: String, $postContent: String) {\n    updatePost(id: $id, title: $postTitle, content: $postContent) {\n      id              # Обязательно для идентификации в кэше\n      title           # Чтобы заголовок обновился в списке\n      content         # Чтобы контент обновился в списке\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n      __typename      # Помогает Apollo понять тип объекта\n      isOwner\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePost($id: ID!, $postTitle: String, $postContent: String) {\n    updatePost(id: $id, title: $postTitle, content: $postContent) {\n      id              # Обязательно для идентификации в кэше\n      title           # Чтобы заголовок обновился в списке\n      content         # Чтобы контент обновился в списке\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n      __typename      # Помогает Apollo понять тип объекта\n      isOwner\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment UserHeaderFields on User {\n      id\n      login\n      avatar\n    }  \n"): (typeof documents)["\n    fragment UserHeaderFields on User {\n      id\n      login\n      avatar\n    }  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      ...UserHeaderFields\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      ...UserHeaderFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetCategories {\n        categories {\n            id\n            name\n            slug\n        }\n    }\n"): (typeof documents)["\n    query GetCategories {\n        categories {\n            id\n            name\n            slug\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            id\n            login\n            avatar\n        }\n    }\n}\n"): (typeof documents)["\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            id\n            login\n            avatar\n        }\n    }\n}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n"): (typeof documents)["\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPostsByCategory($slug: String!) {\n    categoryBySlug(slug: $slug) {\n      id\n      name\n      description\n      posts {\n        id\n        title\n        content\n        createdAt\n        likesCount\n        dislikesCount\n        isLiked\n        isDisliked\n        isOwner\n        user {\n          id\n          login\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPostsByCategory($slug: String!) {\n    categoryBySlug(slug: $slug) {\n      id\n      name\n      description\n      posts {\n        id\n        title\n        content\n        createdAt\n        likesCount\n        dislikesCount\n        isLiked\n        isDisliked\n        isOwner\n        user {\n          id\n          login\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;