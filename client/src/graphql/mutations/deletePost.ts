import { graphql } from '../../gql';


export const DELETE_POST = graphql(`
    mutation DeletePost($id: ID!) {
        deletePost(id: $id) 
            
    }    
`)