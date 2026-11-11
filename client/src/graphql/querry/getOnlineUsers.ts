import { graphql } from "../../gql"

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