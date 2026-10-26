import { graphql } from "../../gql";


export const MESSAGE_DELETED_SUBSCRIPTION = graphql(`
    subscription onMessageDeleted { 
        messageDeleted {
            id
        }
    }    
`)