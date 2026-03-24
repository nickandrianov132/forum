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
    "\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) \n  }\n": typeof types.LoginUserDocument,
    "\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            login\n        }\n    }\n}\n": typeof types.GetOnePostDocument,
    "\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n": typeof types.GetPostsDocument,
};
const documents: Documents = {
    "\n  mutation AddDislike($postId: ID!) {\n    addDislike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n": types.AddDislikeDocument,
    "\n  mutation AddLike($postId: ID!) {\n    addLike(postId: $postId) {\n      id\n      likesCount\n      dislikesCount\n      isLiked\n      isDisliked\n    }\n  }\n": types.AddLikeDocument,
    "\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) \n  }\n": types.LoginUserDocument,
    "\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            login\n        }\n    }\n}\n": types.GetOnePostDocument,
    "\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n": types.GetPostsDocument,
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
export function graphql(source: "\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) \n  }\n"): (typeof documents)["\n  mutation loginUser($login: String!, $password: String!) {\n    loginUser(login: $login, password: $password) \n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            login\n        }\n    }\n}\n"): (typeof documents)["\n    query getOnePost($id: ID!) {\n        post(id: $id) {\n        id\n        title\n        content\n        isLiked\n        isDisliked\n        likesCount\n        dislikesCount\n        isOwner\n        user {\n            login\n        }\n    }\n}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n"): (typeof documents)["\n    query getPosts{\n        posts {\n            id\n            title\n            content\n            isDisliked\n            isLiked\n            likesCount\n            dislikesCount\n            isOwner\n            user {\n            id\n            login\n            }\n        }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;