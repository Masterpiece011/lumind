import { $authHost, $host } from "./page";

export const getSubmissionById = async (submission_id, userId) => {
    try {
        const response = await $authHost.get(
           `/api/submissions/${submission_id}`,
            {
                params: { user_id: userId },
            },
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка загрузки задания",
        );
    }
};

export const createSubmission = async ({
    user_id,
    assignment_id,
    comment,
    investments,
}) => {
    if (!user_id || !assignment_id) {
        throw new Error("Необходимо указать user_id и assignment_id");
    }

    try {
        const response = await $authHost.post("/api/submissions/", {
            user_id,
            assignment_id,
            comment,
            investments,
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка создания задания",
        );
    }
};

export const updateSubmission = async ({ submission_id, comment, investments }) => {
    if (!submission_id) {
        throw new Error("Необходимо указать ID отправки");
    }

    try {
        const response = await $authHost.put(`/api/submissions/${submission_id}`, { comment, investments });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка обновления задания",
        );
    }
};

export const deleteSubmission = async (submission_id) => {
    if (!submission_id) {
        throw new Error("Необходимо указать ID отправки");
    }

    try {
        const response = await $authHost.delete(
            `/api/submissions/${submission_id}`,
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка удаления задания",
        );
    }
};
