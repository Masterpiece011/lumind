import {
    Tasks,
    Assignments,
    Teams_Tasks,
    Teams,
} from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllSelfTeamAssignments(req, res, next) {
    try {
        const { user_id, team_id } = req.body;

        if (!user_id || !team_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать ID пользователя и ID команды"
                )
            );
        }

        // 1. Получаем все task_id для данной команды
        const teamTasks = await Teams_Tasks.findAll({
            where: { team_id },
            attributes: ["task_id"],
            raw: true,
        });

        if (!teamTasks.length) {
            return res.json({ assignments: [], total: 0 });
        }

        const taskIds = teamTasks.map((t) => t.task_id);

        // 2. Ищем assignments пользователя с этими task_id
        
        const { count, rows: assignments } = await Assignments.findAndCountAll({
            where: {
                user_id,
                task_id: taskIds, // Фильтр по task_id из teams_tasks
            },
            attributes: {
                exclude: ["comment", "created_at", "updated_at", "creator_id"],
            },
            include: [
                {
                    model: Tasks,
                    as: "task",
                    attributes: {
                        exclude: ["created_at", "updated_at", "creator_id"],
                    },
                    include: [
                        {
                            model: Teams,
                            as: "teams",
                            through: { attributes: [] },
                            where: { id: team_id },
                            attributes: [
                                "id",
                                "name",
                                "description",
                                "avatar_color",
                            ],
                            required: true,
                        },
                    ],
                },
            ],
        });

        if (count === 0) {
            return res.json({ assignments: [], total: 0 });
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

        return res.json({ assignments: response, total: count });
    } catch (error) {
        next(
            ApiError.internal(`Ошибка при получении заданий: ${error.message}`)
        );
    }
}
