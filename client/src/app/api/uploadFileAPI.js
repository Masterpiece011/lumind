import { $authHost } from "./page";


export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file); 

    try {
        const response = await $authHost.post("/upload/file", formData, {
            headers: { "Content-Type": undefined }
        });

        if (response.status === 200) {
            const data = response.data;
            return data; 
        } else {
            throw new Error("Ошибка загрузки файла");
        }
    } catch (error) {
        if (error.response) {
            console.error("Ответ сервера:", error.response.status, error.response.data);
        } else if (error.request) {
            console.error("Сервер не ответил:", error.request);
        } else {
            console.error("Ошибка при настройке запроса:", error.message);
        }
        throw error;
    }
};

export const uploadMultipleFiles = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file); 
    });

    try {
        const response = await $authHost.post("/upload/files", formData, {
            headers: { "Content-Type": undefined }
        });

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
}