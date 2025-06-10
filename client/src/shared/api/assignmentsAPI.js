import { createAsyncThunk } from "@reduxjs/toolkit";
import { $authHost } from "./page";

export const getAssignments = createAsyncThunk(
    "assignments/getAssignments",
    async ({ userId, teamId, searchQuery, status, creator_id, include }) => {
        try {
            const { data } = await $authHost.post("/api/assignments", {
                user_id: userId,
                team_id: teamId,
                search_text: searchQuery,
                status: status,
                creator_id: creator_id,
                include: include || ["task", "files", "user", "creator"],
            });
            return data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Ошибка получения заданий",
            );
        }
    },
);

export const getUserAssignments = createAsyncThunk(
    "assignments/getUserAssignments",
    async ({ userId, status }, { rejectWithValue }) => {
        try {
            const { data } = await $authHost.post("/api/assignments/get-self", {
                user_id: userId,
                status: status === "all" ? undefined : status,
            });
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Ошибка получения назначений",
            );
        }
    },
);

export const getInstructorAssignments = createAsyncThunk(
    "assignments/getInstructorAssignments",
    async (creatorId, { rejectWithValue }) => {
        try {
            const { data } = await $authHost.post(
                "/api/assignments/instructor/assignments",
                { creator_id: creatorId },
            );
            console.log("getInstructorAssignments data:", data);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Ошибка получения назначений преподавателя",
            );
        }
    },
);

export const getUserTeamAssignments = createAsyncThunk(
    "assignments/getUserTeamAssignments",
    async ({ userId, teamId, status }, { rejectWithValue }) => {
        try {
            const { data } = await $authHost.post(
                "/api/assignments/get-team-assignments",
                {
                    user_id: userId,
                    team_id: teamId,
                    status: status === "all" ? undefined : status,
                },
            );
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Ошибка получения командных назначений",
            );
        }
    },
);

export const getAssignmentById = async (assignmentId) => {
    console.log("Fetching assignment with ID:", assignmentId);
    try {
        const { data } = await $authHost.get(
            `/api/assignments/${assignmentId}`,
        );
        console.log("Received data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching assignment:", error);
        throw new Error("Ошибка загрузки назначения");
    }
};

export const getStudentAssignment = async (assignmentId) => {
    try {
        const { data } = await $authHost.get(
            `/api/assignments/instructor/assignment/${assignmentId}`,
        );

        console.log("Raw API response:", data); // Логируем сырой ответ

        if (!data?.assignment) {
            throw new Error("Неверный формат ответа сервера");
        }

        return data;
    } catch (error) {
        console.error("Full API error:", error.response || error);
        throw new Error(
            error.response?.data?.message || "Ошибка загрузки назначения",
        );
    }
};

export const createAssignment = async (assignmentData) => {
    try {
        const response = await $authHost.post(
            "/api/assignments/",
            assignmentData,
        );

        // Check if response has data
        if (!response.data || typeof response.data !== "object") {
            throw new Error("Неверный формат ответа сервера");
        }

        // Handle both possible response formats
        if (response.data.assignment) {
            // New format: {message: "...", assignment: {...}}
            return response.data;
        } else if (response.data.assignments) {
            // Old format: {assignments: [...], total: X}
            // Extract the last created assignment
            const lastAssignment =
                response.data.assignments[response.data.assignments.length - 1];
            return {
                message: "Назначение успешно создано",
                assignment: lastAssignment,
            };
        } else {
            throw new Error("Неверный формат ответа сервера");
        }
    } catch (error) {
        console.error("Ошибка создания назначения:", error);
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                "Ошибка создания задания",
        );
    }
};

export const updateAssignment = async ({
    assignment_id,
    status,
    assessment,
    comment,
}) => {
    try {
        const response = await $authHost.put("/api/assignments/", {
            assignment_id,
            status,
            assessment,
            comment,
        });

        return {
            ...response.data,
            assignment: {
                ...response.data.assignment,
                files: response.data.assignment.assignment_files || [],
            },
        };
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

export const getStudentsWithAssignments = async (
    taskId,
    teamId,
    page = 1,
    quantity = 10,
) => {
    try {
        const response = await $authHost.post(
            "/api/assignments/instructor/students",
            {
                task_id: taskId ? Number(taskId) : undefined,
                team_id: teamId,
                page,
                quantity,
            },
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};
