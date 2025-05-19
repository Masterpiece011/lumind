import { Tasks, Assignments, Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllSelfAssignments(req, res, next) {
    try {
            const { user_id } = req.body;

            if (!user_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID пользователя")
                );
            }

            const { count, rows: assignments } =
                await Assignments.findAndCountAll({
                    where: { user_id: user_id },
                    attributes: {
                        exclude: [
                            "task_id",
                            "comment",
                            "created_at",
                            "updated_at",
                            "creator_id",
                        ],
                    },
                    include: [
                        {
                            model: Tasks,
                            as: "task",
                            include: [
                                // Включаем команды, связанные с задачей
                                {
                                    model: Teams,
                                    as: "teams", // Убедитесь, что это правильное название ассоциации
                                    through: { attributes: [] }, // Исключаем промежуточную таблицу
                                    attributes: {
                                        exclude: [
                                            "created_at",
                                            "updated_at",
                                            "creator_id",
                                        ],
                                    },
                                    required: false, // Если связь не обязательная
                                },
                            ],
                            attributes: {
                                exclude: [
                                    "created_at",
                                    "updated_at",
                                    "creator_id",
                                ],
                            },
                        },
                    ],
                });

            if (!count === 0) {
                return ApiError.badRequest("Юзер лох у него нет ничего!");
            }

            const response = assignments.map((assignment) => {
                const team =
                    assignment.task.teams?.[0]?.get({ plain: true }) || null;

                const taskData = assignment.task.get({ plain: true });

                // Удаляем teams из task, если не хотим дублирования
                if (taskData.teams) {
                    delete taskData.teams;
                }

                return {
                    id: assignment.id,
                    status: assignment.status,
                    plan_date: assignment.plan_date,
                    user_id: assignment.user_id,
                    task: { ...taskData }, // Разворачиваем поля задачи
                    team: team, // Добавляем команду отдельно
                };
            });

            return res.json({
                assignments: response, // Массив заданий в одном уровне
                total: count,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении заданий: ${error.message}`
                )
            );
        }
}
