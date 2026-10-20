import { graphql } from "../../gql";


export const DELETE_POST_BY_ADMIN = graphql(`
    mutation DeletePostByAdmin($id: ID!) {
        deletePostByAdmin(id: $id)
    }

`)