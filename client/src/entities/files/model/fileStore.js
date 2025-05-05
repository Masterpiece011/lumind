import { getUserFiles, getTeamFiles } from "@/shared/api/uploadFileAPI";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userFiles: [],
    teamFiles: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
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
                state.userFiles = action.payload.files || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
            })
            .addCase(getUserFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(getTeamFiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeamFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.teamFiles =
                    action.payload.page === 1
                        ? action.payload.files
                        : [...state.teamFiles, ...action.payload.files];
                state.total = action.payload.total;
                state.page = action.payload.page;
            })
            .addCase(getTeamFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default fileSlice.reducer;
