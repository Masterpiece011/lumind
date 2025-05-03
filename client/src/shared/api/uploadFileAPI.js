import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getUserFiles = createAsyncThunk(
    "file/getUserFiles",
    async (userId) => {
        const response = await $authHost.get("/api/files/user", {
            params: { user_id: userId },
        });
        console.log("API response data:", response.data);
        return response.data;
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
