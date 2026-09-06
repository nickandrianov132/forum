import { graphql } from '../../gql';


export const GET_POSTS_BY_TOPIC = graphql(`
    query getPostsByTopic($topic: String!) {
        postsByTopic(topic: $topic) {
        id
        topic
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