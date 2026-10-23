import { graphql } from "../../gql";


export const GET_ALL_USERS = graphql(`
    query GetUsers {
        users {
            id
            login
            email
            avatar
            isBanned
            role
        }
    }    
`)