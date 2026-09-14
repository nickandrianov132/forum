import AccountInfo from "../pages/AccountInfo.tsx"
import Posts from "../pages/Posts.tsx"
import { ACCOUNT_INFO_ROUTE, POSTS_ROUTE } from "./constants"


export const authRoutes = [
    {
        path: ACCOUNT_INFO_ROUTE,
        Component: AccountInfo
    },

]

export const publicRoutes = [

    {
        path: POSTS_ROUTE,
        Component: Posts
    }
]