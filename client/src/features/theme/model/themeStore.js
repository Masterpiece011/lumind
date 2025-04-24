import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name: "theme",
    initialState: {
        currentTheme: "dark",
    },
    reducers: {
        toggleTheme: (state) => {
            state.currentTheme =
                state.currentTheme === "dark" ? "light" : "dark";
        },
        setTheme: (state, action) => {
            state.currentTheme = action.payload;
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
