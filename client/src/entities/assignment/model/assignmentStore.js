import {
    getUserAssignments,
    getUserTeamAssignments,
} from "@/shared/api/assignmentsAPI";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userAssignments: {
        data: [],
        total: 0,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    teamAssignments: {
        data: [],
        total: 0,
        loading: false,
        error: null,
        lastUpdated: null,
    },
};

const assignmentSlice = createSlice({
    name: "assignments",
    initialState,
    reducers: {
        clearAssignments: (state) => {
            state.userAssignments = initialState.userAssignments;
            state.teamAssignments = initialState.teamAssignments;
        },
    },
    extraReducers: (builder) => {
        builder
            // Обработка общих назначений
            .addCase(getUserAssignments.pending, (state) => {
                state.userAssignments.loading = true;
                state.userAssignments.error = null;
            })
            .addCase(getUserAssignments.fulfilled, (state, { payload }) => {
                state.userAssignments.data = payload.assignments;
                state.userAssignments.total = payload.total;
                state.userAssignments.loading = false;
                state.userAssignments.lastUpdated = Date.now();
            })
            .addCase(getUserAssignments.rejected, (state, { payload }) => {
                state.userAssignments.error = payload;
                state.userAssignments.loading = false;
            })

            // Обработка командных назначений
            .addCase(getUserTeamAssignments.pending, (state) => {
                state.teamAssignments.loading = true;
                state.teamAssignments.error = null;
            })
            .addCase(getUserTeamAssignments.fulfilled, (state, { payload }) => {
                state.teamAssignments.data = payload.assignments;
                state.teamAssignments.total = payload.total;
                state.teamAssignments.loading = false;
                state.teamAssignments.lastUpdated = Date.now();
            })
            .addCase(getUserTeamAssignments.rejected, (state, { payload }) => {
                state.teamAssignments.error = payload;
                state.teamAssignments.loading = false;
            });
    },
});

export const { clearAssignments } = assignmentSlice.actions;
export default assignmentSlice.reducer;
