import { createSlice } from "@reduxjs/toolkit"


type AccessToken = {
    accessToken: string
}
const initialState: AccessToken = {
    accessToken: localStorage.getItem('token') ?? ""
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            localStorage.setItem('token', action.payload)
            state.accessToken = action.payload
        },
        logout: (state) => {
            localStorage.removeItem('token')
            state.accessToken = ""
        }
    }
})

export const { setToken, logout } = authSlice.actions
export default authSlice.reducer