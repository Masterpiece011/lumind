import { createSlice } from "@reduxjs/toolkit";
import { getAssignments } from "@/shared/api/assignmentsAPI";

const initialState = {
    assignments: [],
    assignmentsTotal: 0,
    loading: false,
    error: null,
};

const assignmentSlice = createSlice({
    name: "assignments",
    initialState,
    reducers: {
        setLoading: (state) => {
            state.loading = true;
        },
        setAssignment: (state, { payload }) => {
            state.assignments = payload.assignments;
            state.assignmentsTotal = payload.total || payload.length || 0;
            state.loading = false;
        },
        setError: (state, { payload }) => {
            state.error = payload;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getAssignments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAssignments.fulfilled, (state, { payload, meta }) => {
                console.log("Assignments loaded for userId:", meta.arg?.userId);

                state.assignments = payload.assignments;
                state.assignmentsTotal = payload.total || payload.length || 0;
                state.loading = false;
            })
            .addCase(getAssignments.rejected, (state, { error, meta }) => {
                console.error(
                    "Error loading teams for userId:",
                    meta.arg?.userId,
                    error,
                );
                state.error = error.message;
                state.loading = false;
            });
    },
});

export const { setLoading, setAssignment, setError } = assignmentSlice.actions;

export default assignmentSlice.reducer;
