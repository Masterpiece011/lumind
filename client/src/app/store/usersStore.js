import { createSlice } from "@reduxjs/toolkit";
import { getUsers } from "../api/userAPI";

const initialState = {
    users: [],
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setLoading: (state) => {
            state.loading = true;
        },
        setTeams: (state, action) => {
            state.users = action.payload;
            state.loading = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.users = action.payload;
                state.loading = false;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            });
    },
});

export const { setLoading, setUsers, setError } = userSlice.actions;

export default userSlice.reducer;
