import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userStore";

export const store = configureStore({
    reducer: {
        user: userReducer, 
    },
});
