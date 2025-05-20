import { $authHost } from "./page";

// Функция для получения токена (проверяет и куки, и localStorage)
const getAuthToken = () => {
    // Если используется HTTP-only кука (рекомендуется для production)
    if (typeof document !== "undefined" && document.cookie) {
        const cookieToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (cookieToken) return cookieToken;
    }

    // Fallback на localStorage (для development)
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
};

export const uploadFiles = async ({
    files,
    entityId,
    entityType,
    onUploadProgress,
}) => {
    const token = localStorage.getItem("token"); // Или из кук

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            "X-Entity-ID": entityId,
            "X-Entity-Type": entityType,
            Authorization: `Bearer ${token}`, // Токен уже содержит userId
        },
        withCredentials: true,
        onUploadProgress,
    };

    try {
        const response = await $authHost.post("/api/files", formData, config);

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Upload failed");
    }
};

export const downloadFile = async ({ fileId, fileName }) => {
    const token = getAuthToken();
    const config = {
        responseType: "blob",
        withCredentials: true,
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    };

    try {
        const response = await $authHost.get(`/api/files/${fileId}`, config);

        const contentDisposition = response.headers["content-disposition"];
        let finalFileName = fileName || "file";

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                finalFileName = filenameMatch[1];
            }
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", finalFileName);
        document.body.appendChild(link);
        link.click();

        // Очистка
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error("Download error:", error);
        throw error;
    }
};

export const deleteFile = async ({ fileId }) => {
    const token = getAuthToken();
    const config = {
        withCredentials: true,
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    };

    try {
        await $authHost.delete(`/api/files/${fileId}`, config);
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении файла ${fileId}:`, error);
        throw error;
    }
};

// Дополнительные методы
export const getUserFiles = async () => {
    const token = getAuthToken();
    const config = {
        withCredentials: true,
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    };

    try {
        const response = await $authHost.post("/api/files/user", {}, config);
        return response.data;
    } catch (error) {
        console.error("Ошибка получения файлов пользователя:", error);
        throw error;
    }
};

export const getTeamFiles = async (teamId) => {
    const token = getAuthToken();
    const config = {
        withCredentials: true,
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    };

    try {
        const { data } = await $authHost.post(
            `/api/files/team/${teamId}`,
            {},
            config,
        );
        return data;
    } catch (error) {
        console.error("Ошибка получения файлов команды:", error);
        throw error;
    }
};
