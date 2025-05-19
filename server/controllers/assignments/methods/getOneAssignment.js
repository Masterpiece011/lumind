import { Tasks, Assignments, Users, Files } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneAssignment(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const assignment = await Assignments.findByPk(id, {
            include: [
                {
                    model: Tasks,
                    as: "task",
                    include: [
                        {
                            model: Files,
                            as: "files",
                            where: { entity_type: "task" },
                            required: false,
                        },
                    ],
                },
                {
                    model: Files,
                    as: "files",
                    where: { entity_type: "assignment" },
                    required: false,
                },
            ],
        });

        if (!assignment) {
            return next(ApiError.notFound("Назначение не найдено"));
        }

        // Проверка прав доступа
        if (
            userRole !== "INSTRUCTOR" &&
            assignment.user_id !== userId &&
            assignment.creator_id !== userId
        ) {
            return next(ApiError.forbidden("Нет доступа к этому заданию"));
        }

        // Получаем данные пользователей
        const [student, creator] = await Promise.all([
            Users.findByPk(assignment.user_id, {
                attributes: ["id", "first_name", "last_name", "email"],
            }),
            Users.findByPk(assignment.creator_id, {
                attributes: ["id", "first_name", "last_name", "email"],
            }),
        ]);

        // Формируем ответ
        const response = {
            ...assignment.get({ plain: true }),
            creator,
            task: {
                ...(assignment.task?.get({ plain: true }) || {}),
                files: assignment.task?.files || [],
            },
            assignment_files: assignment.files || [],
        };

        return res.json({ assignment: response });
    } catch (error) {
        console.error("Ошибка получения задания:", error);
        next(ApiError.internal(error.message));
    }
}
