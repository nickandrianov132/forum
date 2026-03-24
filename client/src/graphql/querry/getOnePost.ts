import { graphql } from '../../gql';


export const GET_ONE_POST = graphql(`
    query getOnePost($id: ID!) {
        post(id: $id) {
        id
        title
        content
        isLiked
        isDisliked
        likesCount
        dislikesCount
        isOwner
        user {
            login
        }
    }
}
`)