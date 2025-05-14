import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getAssignments = createAsyncThunk(
    "assignments/getAssignments",
    async ({ userId, teamId, searchQuery, status, creator_id, include }) => {
        try {
            const { data } = await $authHost.post("/api/assignments", {
                user_id: userId,
                team_id: teamId,
                search_text: searchQuery,
                status: status,
                creator_id: creator_id,
                include: include || ["task", "files", "user", "creator"],
            });
            return data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Ошибка получения заданий",
            );
        }
    },
);

export const getUserAssignments = createAsyncThunk(
    "assignments/getUserAssignments",
    async ({ userId, status }, { rejectWithValue }) => {
        try {
            const { data } = await $authHost.post("/api/assignments/get-self", {
                user_id: userId,
                status: status === "all" ? undefined : status,
            });
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Ошибка получения назначений",
            );
        }
    },
);

export const getUserTeamAssignments = createAsyncThunk(
    "assignments/getUserTeamAssignments",
    async ({ userId, teamId, status }, { rejectWithValue }) => {
        try {
            const { data } = await $authHost.post(
                "/api/assignments/get-team-assignments",
                {
                    user_id: userId,
                    team_id: teamId,
                    status: status === "all" ? undefined : status,
                },
            );
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Ошибка получения командных назначений",
            );
        }
    },
);

export const getAssignmentById = async (assignmentId) => {
    try {
        const { data } = await $authHost.get(
            `/api/assignments/${assignmentId}`,
        );

        if (!data?.assignment) {
            throw new Error("Неверный формат ответа сервера");
        }

        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка загрузки назначения",
        );
    }
};

export const createAssignment = async (assignmentData) => {
    try {
        const response = await $authHost.post(
            "/api/assignments/",
            assignmentData,
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка создания задания",
        );
    }
};

export const updateAssignment = async ({ assignmentId, status, comment }) => {
    try {
        const response = await $authHost.put("/api/assignments/", {
            assignment_id: assignmentId,
            status,
            comment,
        });

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка обновления задания",
        );
    }
};

export const deleteAssignment = async (assignmentId) => {
    try {
        const response = await $authHost.delete(
            `/api/assignments/${assignmentId}`,
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка удаления задания",
        );
    }
};

export const getUsersWithTask = async (taskId) => {
    try {
        const response = await $authHost.get(
            `/api/assignments/team-students/${taskId}`,
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};
