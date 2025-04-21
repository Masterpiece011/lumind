import { createSlice } from "@reduxjs/toolkit";
import { getTeamById, getTeams } from "@/shared/api/teamAPI";

const initialState = {
    teams: [],
    teamsTotal: 0, // Изменил null на 0 для более безопасной работы
    currentTeam: {},
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
        setTeams: (state, { payload }) => {
            state.teams = payload.teams || payload;
            state.teamsTotal = payload.total || payload.length || 0;
            state.loading = false;
        },
        setError: (state, { payload }) => {
            state.error = payload;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTeams.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeams.fulfilled, (state, { payload, meta }) => {
                // Добавил meta.arg для доступа к параметрам запроса
                console.log("Teams loaded for userId:", meta.arg?.userId);

                state.teams = payload.teams || payload;
                state.teamsTotal = payload.total || payload.length || 0;
                state.loading = false;
            })
            .addCase(getTeams.rejected, (state, { error, meta }) => {
                console.error(
                    "Error loading teams for userId:",
                    meta.arg?.userId,
                    error,
                );
                state.error = error.message;
                state.loading = false;
            })
            .addCase(getTeamById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTeamById.fulfilled, (state, { payload }) => {
                state.currentTeam = payload;
                state.loading = false;
            })
            .addCase(getTeamById.rejected, (state, { error }) => {
                state.error = error.message;
                state.loading = false;
            });
    },
});

export const { setLoading, setTeams, setError } = teamSlice.actions;

export default teamSlice.reducer;
