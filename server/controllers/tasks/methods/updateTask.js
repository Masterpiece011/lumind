import { Tasks, Files } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function udpateTask(req, res, next) {
    try {
        const { task_id, title, description, comment, files } = req.body;

        // Находим задание
        const task = await Tasks.findByPk(task_id);

        if (!task) {
            return ApiError.badRequest("Задание не найдено");
        }

        let taskFiles = [];

        // Добавление вложений
        if (files.length > 0) {
            const investmentRecords = files.map((fileUrl) => ({
                entity_id: task_id.id,
                entity_type: "task",
                file_url: fileUrl,
            }));
            taskFiles = await Files.bulkCreate(investmentRecords);
        }

        // Обновляем данные задания
        await task.update({
            title: title || task.title,
            description: description || task.description,
            comment: comment || task.comment,
        });

        // Формируем ответ
        return res.status(200).json({
            success: true,
            data: { task: { task, files: taskFiles } },
            message: "Задание успешно обновлено",
        });
    } catch (error) {
        console.error("Ошибка при обновлении задания:", error);

        return ApiError.badRequest("Невозможно обновить задание");
    }
}
