import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost, $host } from "./page";

export const getTeams = createAsyncThunk("teams/getTeams", async (userId) => {
    try {
        const response = await $authHost.get("/api/teams", {
            params: { user_id: userId },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения команд",
        );
    }
});

export const getTeamFiles = createAsyncThunk(
    "teams/getTeamFiles",
    async (teamId) => {
        try {
            const response = await $authHost.get(`/api/teams/${teamId}/files`);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                    "Ошибка получения файлов команды",
            );
        }
    },
);

export const getTeamById = createAsyncThunk(
    "teams/getTeamById",
    async ({ teamId, userId }) => {
        try {
            const response = await $authHost.get(`/api/teams/${teamId}`, {
                params: { user_id: userId },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Ошибка загрузки команды",
            );
        }
    },
);

export const createTeam = async (teamData) => {
    try {
        const response = await $authHost.post("/api/teams", teamData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка создания команды",
        );
    }
};

export const updateTeam = async (teamData) => {
    try {
        const response = await $authHost.put("/api/teams", teamData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка обновления команды",
        );
    }
};

export const deleteTeam = async (teamId) => {
    try {
        const response = await $authHost.delete(`/api/teams${teamId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка удаления команды",
        );
    }
};
