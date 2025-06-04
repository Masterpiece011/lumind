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
        const { task_id } = req.body; // Берём из тела запроса
        const taskId = task_id ? Number(task_id) : null;

        // 1. Получаем уникальных студентов с назначенными заданиями от этого преподавателя
        const studentAssignments = await Assignments.findAll({
            where: { creator_id: userId },
            attributes: ["user_id"],
            group: ["user_id"],
            raw: true,
        });

        if (studentAssignments.length === 0) {
            return res.json({ students: [] });
        }

        const studentIds = studentAssignments
            .map((a) => a.user_id)
            .filter((id) => id !== userId);

        // 2. Получаем студентов с их данными и группами/командами
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

        // 3. Для каждого студента получаем их задания с инфо о задании (task)
        const studentsWithAssignments = await Promise.all(
            students.map(async (student) => {
                const where = {
                    creator_id: userId,
                    user_id: student.id,
                };

                if (taskId) where.task_id = taskId;

                const assignments = await Assignments.findAll({
                    where,
                    attributes: [
                        "id",
                        "status",
                        "assessment",
                        "comment",
                        "plan_date",
                        "created_at",
                        "task_id",
                        "user_id",
                    ],
                    include: [
                        {
                            model: Tasks,
                            attributes: ["id", "title", "description"],
                            include: [
                                {
                                    model: Files,
                                    where: { entity_type: "task" },
                                    required: false,
                                    attributes: [
                                        "id",
                                        "file_url",
                                        "original_name",
                                    ],
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

                // 4. Оставляем только последние по каждой задаче
                const uniqueAssignments = [];
                const taskMap = new Map();

                assignments.forEach((assignment) => {
                    if (!taskMap.has(assignment.task_id)) {
                        taskMap.set(assignment.task_id, true);
                        uniqueAssignments.push(assignment);
                    }
                });

                return {
                    ...student.get({ plain: true }),
                    assignments: uniqueAssignments.map((a) => ({
                        id: a.id,
                        status: a.status,
                        assessment: a.assessment,
                        comment: a.comment,
                        plan_date: a.plan_date, // Убедимся, что дата включена
                        created_at: a.created_at,
                        task: {
                            id: a.task.id,
                            title: a.task.title,
                            description: a.task.description,
                            files: a.task.files || [],
                        },
                        files: a.files || [],
                    })),
                };
            })
        );

        return res.json({
            students: studentsWithAssignments,
            taskId: taskId || null,
        });
    } catch (error) {
        console.error("Error in getStudentsWithAssignments:", error);
        next(ApiError.internal("Ошибка при получении списка студентов"));
    }
}
