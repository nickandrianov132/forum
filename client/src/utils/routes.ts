import AccountInfo from "../pages/AccountInfo.tsx"
import News from "../pages/News.tsx"
import Posts from "../pages/Posts.tsx"
import { ACCOUNT_INFO_ROUTE, GUIDES_ROUTE, NEWS_ROUTE, POSTS_ROUTE } from "./constants"


export const authRoutes = [
    {
        path: ACCOUNT_INFO_ROUTE,
        Component: AccountInfo
    },

]

export const publicRoutes = [
    {
        path: NEWS_ROUTE,
        Component: News
    },
    {
        path: GUIDES_ROUTE,
        Component: News
    },
    {
        path: POSTS_ROUTE,
        Component: Posts
    }
]