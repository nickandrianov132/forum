import UserAccauntInfo from "../components/header/content/UserAccauntInfo.tsx"
import UserAccountSettings from "../components/header/content/UserAccounntSettings.tsx"
import CreatePost from "../pages/posts/CreatePost.tsx"
import Posts from "../pages/posts/Posts.tsx"
import Registration from "../pages/Registration.tsx"
import { ACCOUNT_INFO_ROUTE, ACCOUNT_SETTINGS_ROUTE, CREATE_NEW_POST, POSTS_ROUTE, USER_REGISTRATION } from "./constants"


export const authRoutes = [
    {
        path: ACCOUNT_INFO_ROUTE,
        Component: UserAccauntInfo
    },
    {
        path: ACCOUNT_SETTINGS_ROUTE,
        Component: UserAccountSettings
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
    },
    {
        path: USER_REGISTRATION,
        Component: Registration
    }
]