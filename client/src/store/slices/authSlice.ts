import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


type AccessToken = {
    accessToken: string
}
const initialState: AccessToken = {
    accessToken: localStorage.getItem('token') ?? ""
}

// const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers: {
//         setToken: (state, action) => {
//             localStorage.setItem('token', action.payload)
//             state.accessToken = action.payload
//         },
//         logout: (state) => {
//             localStorage.removeItem('token')
//             state.accessToken = ""
//         }
//     }
// })

// export const { setToken, logout } = authSlice.actions
// export default authSlice.reducer
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Вызываем при логине/регистрации и ПРИ РЕФРЕШЕ
        setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            const { accessToken, refreshToken } = action.payload;
            
            // Сохраняем оба в хранилище
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            // В стейт кладем только access
            state.accessToken = accessToken;
        },
        logout: (state) => {
            // Чистим всё под ноль
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            state.accessToken = "";
        }
    }
})

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;