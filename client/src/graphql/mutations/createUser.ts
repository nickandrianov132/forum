import { graphql } from "../../gql";

export const ADD_USER = graphql(`
    mutation AddUser($login: String!, $password: String!, $email: String!, $avatar: String) {
        addUser(login: $login, password: $password, email: $email, avatar: $avatar) {
            user{
                id
                login
                email
                avatar
                createdAt
            }
        }
    }
`)