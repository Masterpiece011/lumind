import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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

export const uploadFiles = async ({ file, entityId, entityType }) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            "X-Entity-ID": entityId,
            "X-Entity-Type": entityType,
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true, // Важно для работы с HTTP-only куками
    };

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/files`,
            formData,
            config,
        );
        return { files: [response.data] };
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        throw error;
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
        const response = await axios.get(
            `${API_BASE_URL}/api/files/${fileId}`,
            config,
        );

        // Получаем имя файла из заголовков или используем переданное
        const contentDisposition = response.headers["content-disposition"];
        const finalFileName =
            contentDisposition?.match(/filename="?(.+)"?/)?.[1] ||
            fileName ||
            "file";

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", finalFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Download error:", error);
        throw error;
    }
};

export const deleteFile = async (fileId) => {
    const token = getAuthToken();
    const config = {
        withCredentials: true,
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    };

    try {
        await axios.delete(`${API_BASE_URL}/api/files/${fileId}`, config);
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
        const response = await axios.post(
            `${API_BASE_URL}/api/files/user`,
            {},
            config,
        );
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
        const response = await axios.post(
            `${API_BASE_URL}/api/files/team/${teamId}`,
            {},
            config,
        );
        return response.data;
    } catch (error) {
        console.error("Ошибка получения файлов команды:", error);
        throw error;
    }
};
