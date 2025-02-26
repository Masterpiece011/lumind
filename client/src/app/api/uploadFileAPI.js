import { $authHost } from "./page";

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await $authHost.post("/upload/file", formData, {
            headers: { "Content-Type": undefined },
        });

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
        const response = await $authHost.post("/upload/files", formData, {
            headers: { "Content-Type": undefined },
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
};
