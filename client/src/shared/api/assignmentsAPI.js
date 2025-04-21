import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getAssignments = createAsyncThunk(
    "assignments/getAssignments",
    async ({ userId, searchQuery }) => {
        try {
            console.log("ass", userId);

            const { data } = await $authHost.post("/api/assignments", {
                user_id: userId,
                search_text: searchQuery,
            });

            console.log(data);

            return data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Ошибка получения заданий",
            );
        }
    },
);

export const getAssignmentById = async (assignmentId, userId, taskId) => {
    try {
        const { data } = await $authHost.get(
            `/api/assignments/${assignmentId}`,
            { params: { user_id: userId, task_id: taskId } },
        );
        return data;
    } catch (error) {
        throw new Error(error.data?.message || "Ошибка загрузки задания");
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
