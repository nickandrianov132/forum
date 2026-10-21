import { graphql } from "../../gql";


export const UNBAN_USER = graphql(`
    mutation UnbanUser($login: String!) {
        unbanUser(login: $login)
    }    
`)

