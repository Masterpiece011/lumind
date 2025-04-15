import { createSlice } from "@reduxjs/toolkit";
import { getAssignments } from "../../../shared/api/assignmentsAPI";

const initialState = {
    assignments: [],
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
        setAssignment: (state, action) => {
            state.assignments = action.payload;
            state.loading = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getAssignments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAssignments.fulfilled, (state, action) => {
                state.assignments = action.payload;
                state.loading = false;
            })
            .addCase(getAssignments.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            });
    },
});

export const { setLoading, setAssignment, setError } = assignmentSlice.actions;

export default assignmentSlice.reducer;
