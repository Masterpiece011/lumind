import { Tasks, Teams, Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createTeamTask(req, res, next) {
    try {
        const { team_id, task_id } = req.body;

        if (!team_id || !task_id) {
            return ApiError.badRequest(
                "Необходимо указать ID команды и задания"
            );
        }

        // Проверка существования команды и задания
        const [task, team] = await Promise.all([
            Tasks.findByPk(task_id),
            Teams.findByPk(team_id),
        ]);

        if (!task) {
            return ApiError.badRequest("Задание не найдено");
        }

        if (!team) {
            return ApiError.badRequest("Команда не найдена");
        }

        // Создание связи с обработкой уникальности
        const team_task = await Teams_Tasks.create(
            { team_id, task_id },
            { returning: true }
        );

        return res.status(201).json({
            success: true,
            data: team_task,
        });
    } catch (e) {
        console.log("Ошибка создания связки команды с заданием", e);

        return ApiError.internal("Ошибка создания связки команды с заданием");
    }
}
