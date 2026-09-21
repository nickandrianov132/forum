import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UserHeaderFieldsFragment } from "../../gql/graphql"

// делаем облегченный тип для авторизованного пользователя
// export type AuthUser = Pick<User, "id" | "login" | "avatar">;

type AccessToken = {
    accessToken: string
    user: UserHeaderFieldsFragment | null
}
const initialState: AccessToken = {
    accessToken: localStorage.getItem('token') ?? "",
    user: null
}
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Вызываем при логине/регистрации и ПРИ РЕФРЕШЕ
        setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string, user: UserHeaderFieldsFragment }>) => {
            const { accessToken, refreshToken, user } = action.payload;
            // Сохраняем оба в хранилище
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            // В стейт кладем только access
            state.accessToken = accessToken;
            if (user) state.user = user;
        },
        logout: (state) => {
            // Чистим всё под ноль
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            state.accessToken = "";
            state.user = null;
        }
    }
})

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;