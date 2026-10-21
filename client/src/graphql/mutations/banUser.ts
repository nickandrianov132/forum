import { graphql } from "../../gql";


export const BAN_USER = graphql(`
    mutation BanUser($input: BanUserInput!) {
        banUser( input: $input )
    }   
`)