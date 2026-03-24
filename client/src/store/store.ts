import { configureStore } from "@reduxjs/toolkit";
import authSlice from './slices/authSlice'


export const store = configureStore({
    reducer: {
        user: authSlice
    }
})
// 1. Создаем тип RootState на основе самого стора
export type RootState = ReturnType<typeof store.getState>;
// 2. Тип для диспатча (тоже пригодится)
export type AppDispatch = typeof store.dispatch;