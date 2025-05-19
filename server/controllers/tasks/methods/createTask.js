import { Tasks, Users, Files } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createTask(req, res, next) {
    try {
        const {
            title,
            description,
            comment,
            creator_id,
            files = [],
        } = req.body;

        // Проверка обязательных полей
        if (!title || !creator_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать название задания и создателя"
                )
            );
        }

        const user = await Users.findByPk(creator_id);
        if (!user) {
            return next(ApiError.badRequest("Пользователя не существует"));
        }

        // Создание задания
        const task = await Tasks.create({
            title,
            description,
            comment,
            creator_id,
        });

        // Добавление вложений задания
        let taskFiles = [];
        if (files.length > 0) {
            taskFiles = await Files.bulkCreate(
                files.map((fileUrl) => ({
                    entity_id: task.id,
                    entity_type: "task",
                    file_url: fileUrl,
                }))
            );
        }

        return res.status(201).json({
            message: "Задание успешно создано",
            task: {
                ...task.get({ plain: true }),
                files: taskFiles,
            },
        });
    } catch (error) {
        console.error("Ошибка создания задания:", error);
        next(
            ApiError.internal("Ошибка при создании задания: " + error.message)
        );
    }
}
