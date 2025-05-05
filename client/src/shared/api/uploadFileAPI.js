import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getUserFiles = createAsyncThunk(
    "file/getUserFiles",
    async (
        { userId, page = 1, quantity = 8, searchQuery = "" },
        { rejectWithValue },
    ) => {
        try {
            const response = await $authHost.post("/api/files/user", {
                user_id: userId,
                page,
                quantity,
                search_text: searchQuery,
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Ошибка получения файлов",
            );
        }
    },
);

export const getTeamFiles = createAsyncThunk(
    "files/getTeamFiles",
    async ({ teamId, page = 1, quantity = 10 }, { rejectWithValue }) => {
        console.groupCollapsed(
            `API: Запрос файлов команды (teamId: ${teamId})`,
        );
        try {
            console.log("Отправка запроса:", {
                endpoint: `/api/files/team/${teamId}`,
                method: "POST",
                params: { page, quantity },
                timestamp: new Date().toISOString(),
            });

            const startTime = performance.now();
            const response = await $authHost.post(`/api/files/team/${teamId}`, {
                page,
                quantity,
            });
            const endTime = performance.now();

            console.log("Успешный ответ:", {
                status: response.status,
                data: {
                    filesCount: response.data.files?.length || 0,
                    totalFiles: response.data.total,
                    page: response.data.page,
                    totalPages: response.data.totalPages,
                },
                time: `${(endTime - startTime).toFixed(2)}ms`,
                timestamp: new Date().toISOString(),
            });

            console.groupEnd();
            return response.data;
        } catch (error) {
            console.error("Ошибка запроса:", {
                error: {
                    message: error.message,
                    response: {
                        status: error.response?.status,
                        data: error.response?.data,
                    },
                    stack: error.stack,
                },
                timestamp: new Date().toISOString(),
            });

            console.groupEnd();
            return rejectWithValue({
                message:
                    error.response?.data?.message ||
                    "Ошибка загрузки файлов команды",
                status: error.response?.status,
            });
        }
    },
);

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("Отправка файла:", file.name);

    try {
        const response = await $authHost.post("/upload/file", formData);

        if (response.status === 200) {
            const data = response.data;
            return {
                filePath: data.filePath,
            };
        } else {
            throw new Error("Ошибка загрузки файла");
        }
    } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        throw error;
    }
};

export const uploadMultipleFiles = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    try {
        const response = await $authHost.post("/upload/files", formData, {});

        if (response.status === 200) {
            const data = response.data;
            return data;
        } else {
            throw new Error("Ошибка загрузки файлов");
        }
    } catch (error) {
        console.error("Ошибка при загрузке файлов:", error);
        throw error;
    }
};

export const downloadFile = async (filePath) => {
    try {
        const normalizedPath = filePath.replace(/\\/g, "/");

        const response = await $authHost.get("/upload/download", {
            params: { path: normalizedPath },
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        const fileName = normalizedPath.split("/").pop() || "file";

        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error("Download error:", error);
        if (error.response?.data) {
            // Если сервер вернул ошибку в виде Blob, читаем его
            const errorText = await error.response.data.text();
            throw new Error(errorText || "Ошибка при скачивании файла");
        }
        throw new Error(error.message || "Ошибка при скачивании файла");
    }
};
