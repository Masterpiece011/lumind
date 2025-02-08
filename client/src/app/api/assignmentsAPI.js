import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getAssignments = createAsyncThunk(
    "assignments/getAssignments",
    async (userId) => {
        try {
            const response = await $authHost.get("/api/assignments", {
                params: { user_id: userId },
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Ошибка получения заданий",
            );
        }
    },
);

export const getAssignmentById = async (assignmentId, userId) => {
    try {
        const response = await $authHost.get(
            `/api/assignments/${assignmentId}`,
            { params: { user_id: userId } },
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка загрузки задания",
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
