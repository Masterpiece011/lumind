import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuth: false,
    user: null,
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
        logout: (state) => {
            state.isAuth = false;
            state.user = null;
            localStorage.removeItem("token");
        },
    },
});

export const { setIsAuth, setUser, logout } = userStore.actions;
export default userStore.reducer;
