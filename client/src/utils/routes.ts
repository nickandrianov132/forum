import AccountInfo from "../pages/AccountInfo.tsx"
import CreatePost from "../pages/posts/CreatePost.tsx"
import Posts from "../pages/posts/Posts.tsx"
import { ACCOUNT_INFO_ROUTE, CREATE_NEW_POST, POSTS_ROUTE } from "./constants"


export const authRoutes = [
    {
        path: ACCOUNT_INFO_ROUTE,
        Component: AccountInfo
    },
    {
        path: CREATE_NEW_POST,
        Component: CreatePost
    }

]

export const publicRoutes = [

    {
        path: POSTS_ROUTE,
        Component: Posts
    }
]