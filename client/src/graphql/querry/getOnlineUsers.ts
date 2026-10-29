import { graphql } from "../../gql"

// 1. Создаем фрагмент здесь
// const ONLINE_USER_FIELDS = graphql(`
//   fragment OnlineUserFields on User {
//     id
//     login
//     avatar
//     isOnline
//   }
// `);

export const GET_USERS_ONLINE = graphql(`
    query GetOnlineUsers {
        getOnlineUsers {
           id
           login
           avatar
           isOnline
           role
        }
    }    
`)

export const USER_STATUS_SUBSCRIPTION = graphql(`
    subscription UserStatusChanged {
        userStatusChanged {
           id
           login
           avatar
           isOnline
           role
        }
    }    
`)
// const ONLINE_USER_FIELDS = graphql(`
//   fragment OnlineUserFields on User {
//     id
//     login
//     avatar
//     isOnline
//   }
// `);

// export const GET_USERS_ONLINE = graphql(`
//     query GetOnlineUsers {
//         getOnlineUsers {
//             ...OnlineUserFields
//         }
//     }    
// `)

// export const USER_STATUS_SUBSCRIPTION = graphql(`
//     subscription UserStatusChanged {
//         userStatusChanged {
//             ...OnlineUserFields
//         }
//     }    
// `)