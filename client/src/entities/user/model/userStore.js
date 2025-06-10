import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
    isAuth: false,
    user: null,
    isLoggingOut: false,
};

export const userStore = createSlice({
    name: "user",
    initialState,
    reducers: {
        setIsAuth: (state, action) => {
            state.isAuth = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        startLogout: (state) => {
            state.isLoggingOut = true;
        },
        logout: (state) => {
            state.isAuth = false;
            state.user = null;
            state.isLoggingOut = false;
            Cookies.remove("token");
        },
    },
});

export const { setIsAuth, setUser, logout, startLogout } = userStore.actions;
export default userStore.reducer;
