import { $authHost, $host } from "./page";
export const getSubmissionById = async (submissionId, userId) => {
    try {
        const response = await $authHost.get(
            `/api/submissions/${submissionId}`,
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

export const updateSubmission = async ({ id, comment, investments }) => {
    if (!id) {
        throw new Error("Необходимо указать ID отправки");
    }

    try {
        const response = await $authHost.put("/api/submissions/", {
            id,
            comment,
            investments,
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка обновления задания",
        );
    }
};

export const deleteSubmission = async (submissionId) => {
    if (!submissionId) {
        throw new Error("Необходимо указать ID отправки");
    }

    try {
        const response = await $authHost.delete(
            `/api/submissions/${submissionId}`,
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка удаления задания",
        );
    }
};
