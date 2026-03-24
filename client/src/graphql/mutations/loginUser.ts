import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation loginUser($login: String!, $password: String!) {
    loginUser(login: $login, password: $password) 
  }
`;