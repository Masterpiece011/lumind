import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getSubmissionById,
    getUserSubmissions,
} from "@/shared/api/submissionAPI";

export const fetchSubmissionById = createAsyncThunk(
    "submissions/fetchById",
    async ({ submission_id, userId }, thunkAPI) => {
        try {
            return await getSubmissionById(submission_id, userId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    },
);

const initialState = {
    submissions: [],
    loading: false,
    error: null,
};

const submissionSlice = createSlice({
    name: "submissions",
    initialState,
    reducers: {
        setLoading: (state) => {
            state.loading = true;
        },
        setSubmission: (state, action) => {
            state.submissions = action.payload;
            state.loading = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubmissionById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSubmissionById.fulfilled, (state, action) => {
                state.submissions = action.payload;
                state.loading = false;
            })
            .addCase(fetchSubmissionById.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })

            .addCase(getUserSubmissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserSubmissions.fulfilled, (state, action) => {
                state.submissions = action.payload;
                state.loading = false;
            })
            .addCase(getUserSubmissions.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    },
});

export const { setLoading, setSubmission, setError } = submissionSlice.actions;

export default submissionSlice.reducer;
