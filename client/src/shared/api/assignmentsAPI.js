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

export const getAssignmentById = async (id) => {
    try {
        const { data } = await $authHost.get(`/api/assignments/${id}`);

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

export const updateAssignment = async (assignmentData) => {
    try {
        const response = await $authHost.put(
            "/api/assignments/",
            assignmentData,
        );
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
        console.log(`Fetching team students for task: ${taskId}`);
        const { data } = await $authHost.get(
            `/api/assignments/team-students/${taskId}`,
        );
        console.log("Team students response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching team students:", error);
        throw new Error(
            error.response?.data?.message ||
                "Ошибка загрузки студентов команды",
        );
    }
};
