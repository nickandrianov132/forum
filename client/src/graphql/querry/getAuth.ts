import { graphql } from '../../gql';

export const USER_HEADER_FRAGMENT = graphql(`
    fragment UserHeaderFields on User {
      id
      login
      avatar
      role
      isBanned
    }  
`)


export const GET_ME = graphql(`
  query Me {
    me {
      ...UserHeaderFields
    }
  }
`);