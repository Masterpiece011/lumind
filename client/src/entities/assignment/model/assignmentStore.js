import {
    getInstructorAssignments,
    getUserAssignments,
    getUserTeamAssignments,
} from "@/shared/api/assignmentsAPI";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userAssignments: {
        data: [],
        total: 0,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    teamAssignments: {
        data: [],
        total: 0,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    instructorAssignments: {
        data: {
            assignmentsByTask: [],
            total: 0,
        },
        loading: false,
        error: null,
        lastUpdated: null,
    },
};

const assignmentSlice = createSlice({
    name: "assignments",
    initialState,
    reducers: {
        clearAssignments: (state) => {
            state.userAssignments = initialState.userAssignments;
            state.teamAssignments = initialState.teamAssignments;
            state.instructorAssignments = initialState.instructorAssignments;
        },
        // Добавляем новый reducer для добавления назначения
        addAssignment: (state, action) => {
            const { assignment } = action.payload;

            if (state.instructorAssignments.data.assignmentsByTask) {
                const taskId = assignment.task_id;
                let taskGroup =
                    state.instructorAssignments.data.assignmentsByTask.find(
                        (group) => group.task?.id === taskId,
                    );

                if (!taskGroup) {
                    // Создаем новую группу если не существует
                    taskGroup = {
                        task: assignment.task || {
                            id: taskId,
                            title: assignment.task?.title || "Новое задание",
                            description: "",
                            comment: "",
                            files: [],
                        },
                        team: assignment.team || null,
                        assignments: [],
                    };
                    state.instructorAssignments.data.assignmentsByTask.unshift(
                        taskGroup,
                    );
                }

                // Добавляем новое назначение в начало массива
                taskGroup.assignments.unshift({
                    id: assignment.id,
                    status: assignment.status,
                    plan_date: assignment.plan_date,
                    user_id: assignment.user_id,
                    user: assignment.user || { id: assignment.user_id },
                });

                state.instructorAssignments.data.total += 1;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Обработка общих назначений
            .addCase(getUserAssignments.pending, (state) => {
                state.userAssignments.loading = true;
                state.userAssignments.error = null;
            })
            .addCase(getUserAssignments.fulfilled, (state, { payload }) => {
                state.userAssignments.data = payload.assignments || [];
                state.userAssignments.total = payload.total || 0;
                state.userAssignments.loading = false;
                state.userAssignments.error = null;
                state.userAssignments.lastUpdated = Date.now();
            })
            .addCase(getUserAssignments.rejected, (state, { error }) => {
                state.userAssignments.loading = false;
                state.userAssignments.error = error.message;
            })

            // Обработка командных назначений
            .addCase(getUserTeamAssignments.pending, (state) => {
                state.teamAssignments.loading = true;
                state.teamAssignments.error = null;
            })
            .addCase(getUserTeamAssignments.fulfilled, (state, { payload }) => {
                state.teamAssignments.data = payload.assignments;
                state.teamAssignments.total = payload.total;
                state.teamAssignments.loading = false;
                state.teamAssignments.lastUpdated = Date.now();
            })
            .addCase(getUserTeamAssignments.rejected, (state, { payload }) => {
                state.teamAssignments.error = payload;
                state.teamAssignments.loading = false;
            })

            // Обработка назначений преподавателя
            .addCase(getInstructorAssignments.pending, (state) => {
                state.instructorAssignments.loading = true;
                state.instructorAssignments.error = null;
            })
            .addCase(
                getInstructorAssignments.fulfilled,
                (state, { payload }) => {
                    console.log("Полученные данные:", payload);
                    state.instructorAssignments.data = {
                        assignmentsByTask: payload.assignmentsByTask || [],
                        total: payload.total || 0,
                    };
                    state.instructorAssignments.loading = false;
                    state.instructorAssignments.error = null;
                    state.instructorAssignments.lastUpdated = Date.now();
                },
            )
            .addCase(getInstructorAssignments.rejected, (state, action) => {
                state.instructorAssignments.loading = false;
                state.instructorAssignments.error = action.payload;
            });
    },
});

export const { clearAssignments } = assignmentSlice.actions;
export const { addAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;
