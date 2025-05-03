import { getUserFiles } from "@/shared/api/uploadFileAPI";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userFiles: [],
    loading: false,
    error: null,
};

const fileSlice = createSlice({
    name: "files",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserFiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.userFiles = action.payload.files || action.payload || [];
            })
            .addCase(getUserFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default fileSlice.reducer;
