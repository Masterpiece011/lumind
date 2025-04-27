import { createSlice } from "@reduxjs/toolkit";
import { getTeamById, getTeams } from "@/shared/api/teamAPI";

const initialState = {
    teams: [],
    teamsTotal: 0,
    currentTeam: {},
    teamFiles: [],
    loading: false,
    initialized: false,
    error: null,
    lastUserId: null,
};

const teamSlice = createSlice({
    name: "teams",
    initialState,
    reducers: {
        resetTeams: (state) => {
            state.teams = [];
            state.teamsTotal = 0;
            state.initialized = false;
            state.lastUserId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTeams.pending, (state, { meta }) => {
                const { userId } = meta.arg || {};

                if (!userId || userId === state.lastUserId) {
                    return state;
                }

                state.loading = true;
                state.error = null;
                state.lastUserId = userId;
            })
            .addCase(getTeams.fulfilled, (state, { payload, meta }) => {
                const { userId } = meta.arg || {};

                if (!userId || userId !== state.lastUserId) {
                    return state;
                }

                state.teams = payload.teams || payload;
                state.teamsTotal = payload.total || payload.length || 0;
                state.loading = false;
                state.initialized = true;
            })
            .addCase(getTeams.rejected, (state, { error, meta }) => {
                const { userId } = meta.arg || {};

                if (!userId || userId !== state.lastUserId) {
                    return state;
                }

                state.error = error.payload || error.message;
                state.loading = false;
            })
            .addCase(getTeamById.pending, (state) => {
                state.currentTeam = {};
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeamById.fulfilled, (state, { payload }) => {
                state.currentTeam = payload.team || payload;
                state.loading = false;
            })
            .addCase(getTeamById.rejected, (state, { error }) => {
                state.error = error.message;
                state.loading = false;
            });
    },
});

export const { setLoading, setTeams, setError, resetTeams } = teamSlice.actions;
export default teamSlice.reducer;
