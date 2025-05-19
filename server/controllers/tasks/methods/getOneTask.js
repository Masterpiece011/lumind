import { Tasks, Files } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneTask(req, res, next) {
    try {
        const { id } = req.params;

        const task = await Tasks.findByPk(id);

        if (!task) {
            return ApiError.badRequest("Задание не найдено");
        }

        const taskInvestments = await Files.findAll({
            where: {
                entity_id: id,
                entity_type: "task",
            },
        });

        const taskData = {
            task: task,
            task_files: taskInvestments,
        };

        return res.json({ task: taskData });
    } catch (error) {
        console.log("Не удалось найти задание", error);

        return ApiError.internal("Ошибка получения задания");
    }
}
