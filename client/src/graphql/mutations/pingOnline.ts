import { graphql } from "../../gql";


export const PING_ONLINE_MUTATION = graphql(`
    mutation PingOnline {
        pingOnline
    }    
`)