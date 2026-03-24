// import { gql } from "@apollo/client";
import { graphql } from '../../gql';

// export const GET_POSTS = gql`
//     query getPosts{
//         posts {
//             id
//             title
//             content
//             isDisliked
//             isLiked
//             likes {
//             id
//             }
//             likesCount
//             dislikes {
//             id
//             }
//             dislikesCount
//             user {
//             id
//             login
//             }
//         }
//     }
// `
export const GET_POSTS = graphql(`
    query getPosts{
        posts {
            id
            title
            content
            isDisliked
            isLiked
            likesCount
            dislikesCount
            isOwner
            user {
            id
            login
            }
        }
    }
`)