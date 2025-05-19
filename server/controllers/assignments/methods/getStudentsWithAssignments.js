import {
    Assignments,
    Files,
    Groups,
    Tasks,
    Teams,
    Users,
} from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getStudentsWithAssignments(req, res, next) {
    try {
        const userId = req.user.id;
        const { taskId } = req.query;

        // 1. Формируем условия запроса
        const where = { creator_id: userId };

        if (taskId) where.task_id = taskId;

        // 2. Получаем все назначения
        const assignments = await Assignments.findAll({
            where,
            include: [
                {
                    model: Tasks,
                    attributes: ["id", "title", "description"],
                    include: [
                        {
                            model: Files,
                            where: { entity_type: "task" },
                            required: false,
                            attributes: ["id", "file_url", "original_name"],
                        },
                    ],
                },
                {
                    model: Files,
                    where: { entity_type: "assignment" },
                    required: false,
                    attributes: ["id", "file_url", "original_name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // 3. Получаем ID всех студентов (исключая самого преподавателя)
        const studentIds = [
            ...new Set(assignments.map((a) => a.user_id)),
        ].filter((id) => id !== userId); // Исключаем преподавателя

        if (studentIds.length === 0) {
            return res.json({ students: [] });
        }

        // 4. Получаем информацию о студентах с группами и командами
        const students = await Users.findAll({
            where: { id: studentIds },
            attributes: [
                "id",
                "first_name",
                "last_name",
                "middle_name",
                "email",
            ],
            include: [
                {
                    model: Groups,
                    as: "group",
                    attributes: ["id", "title"],
                },
                {
                    model: Teams,
                    as: "teams",
                    through: { attributes: [] },
                    attributes: ["id", "name"],
                },
            ],
        });

        // 5. Создаем и заполняем маппинг студентов
        const studentsMap = new Map();
        students.forEach((student) => {
            studentsMap.set(student.id, {
                ...student.get({ plain: true }),
                assignments: [],
            });
        });

        assignments.forEach((assignment) => {
            if (studentsMap.has(assignment.user_id)) {
                studentsMap.get(assignment.user_id).assignments.push({
                    id: assignment.id,
                    status: assignment.status,
                    assessment: assignment.assessment,
                    comment: assignment.comment,
                    plan_date: assignment.plan_date,
                    created_at: assignment.created_at,
                    task: {
                        id: assignment.task.id,
                        title: assignment.task.title,
                        description: assignment.task.description,
                        files: assignment.task.files || [],
                    },
                    files: assignment.files || [],
                });
            }
        });

        return res.json({
            students: Array.from(studentsMap.values()),
            taskId: taskId || null,
        });
    } catch (error) {
        console.error("Error in getStudentsWithAssignments:", error);
        next(ApiError.internal("Ошибка при получении списка студентов"));
    }
}
