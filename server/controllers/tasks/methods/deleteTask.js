import { Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteTask(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID задания обязательно",
            });
        }

        const task = await Tasks.findByPk(id);

        if (!task) {
            return ApiError.badRequest("Задание не найдено");
        }

        const taskTitle = `${task.title}`;

        await task.destroy();

        return res.status(200).json({
            success: true,
            message: `Задание ${taskTitle} успешно удалено`,
        });
    } catch (error) {
        console.error("Ошибка удаления задания:", error);

        return ApiError.internal("Ошибка удаления задания");
    }
}
