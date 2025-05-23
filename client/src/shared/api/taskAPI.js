import { $authHost } from "./page";

export const createTask = async (taskData) => {
    try {
        const response = await $authHost.post("/api/tasks/create", taskData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка создания задания",
        );
    }
};

export const getTasks = async (params = {}) => {
    try {
        const response = await $authHost.post("/api/tasks/", params);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения заданий",
        );
    }
};

export const getTaskById = async (id) => {
    try {
        const response = await $authHost.get(`/api/tasks/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения задания",
        );
    }
};
