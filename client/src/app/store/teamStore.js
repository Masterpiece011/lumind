import { createSlice } from "@reduxjs/toolkit";
import { getTeamById, getTeams } from "../api/teamAPI";

const initialState = {
    teams: [],
    currentTeam: null,
    teamFiles: [],
    loading: false,
    error: null,
};

const teamSlice = createSlice({
    name: "teams",
    initialState,
    reducers: {
        setLoading: (state) => {
            state.loading = true;
        },
        setTeams: (state, action) => {
            state.teams = action.payload;
            state.loading = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getTeams.pending, (state) => {
                state.loading = true;
            })
            .addCase(getTeams.fulfilled, (state, action) => {
                state.teams = action.payload;
                state.loading = false;
            })
            .addCase(getTeams.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(getTeamById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getTeamById.fulfilled, (state, action) => {
                state.currentTeam = action.payload;
                state.loading = false;
            })
            .addCase(getTeamById.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            });
    },
});

export const { setLoading, setTeams, setError } = teamSlice.actions;

export default teamSlice.reducer;
