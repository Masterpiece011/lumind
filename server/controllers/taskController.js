import dotenv from "dotenv";
dotenv.config();

import ApiError from "../error/ApiError.js";

import { Op } from "sequelize";

import { Files, Tasks, Users } from "../models/models.js";

class TaskController {
    // Создание команды

    async create(req, res, next) {
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
                ApiError.internal(
                    "Ошибка при создании задания: " + error.message
                )
            );
        }
    }
    // Получение всех заданий

    async getAll(req, res) {
        try {
            const {
                page = 1,
                quantity = 10,
                order = "ASC",
                search_text = "",
            } = req.body;

            // Рассчитываем смещение (offset)
            const offset = (page - 1) * quantity;

            // Формируем условия для поиска
            const where = {};
            if (search_text) {
                where[Op.or] = [{ title: { [Op.iLike]: `%${search_text}%` } }];
            }

            // Нормализация параметра сортировки
            const normalizeOrder = (orderParam) => {
                if (
                    orderParam.toUpperCase() === "ASC" ||
                    orderParam.toUpperCase() === "DESC"
                ) {
                    return [["title", orderParam]];
                }

                if (typeof orderParam === "string") {
                    const [field, direction] = orderParam.split(":");
                    return [[field || "title", direction || "ASC"]];
                }

                if (Array.isArray(orderParam) && orderParam.length === 2) {
                    return [orderParam];
                }

                return [["title", "ASC"]];
            };

            const sequelizeOrder = normalizeOrder(order);

            // Получаем общее количество пользователей
            const totalTasks = await Tasks.count({ where });

            // Получаем пользователей с пагинацией
            const tasks = await Tasks.findAll({
                where,
                limit: quantity,
                offset: offset,
                order: sequelizeOrder,
                subQuery: false,
            });

            return res.json({ tasks: { tasks, total: totalTasks } });
        } catch (error) {
            console.error("Ошибка получения заданий:", error);
            return res.status(500).json({
                message: "Ошибка получения заданий",
                error: error.message,
            });
        }
    }

    // Получение одного пользователя по ID

    async getOne(req, res) {
        const { id } = req.params;

        try {
            const task = await Tasks.findByPk(id);

            if (!task) {
                return res.status(404).json({ message: "Задание не найдено" });
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

            return ApiError.internal("Ошибка поиска");
        }
    }

    // Обновление задания

    async update(req, res) {
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

    // Удаление задания

    async delete(req, res) {
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
                return res.status(404).json({
                    success: false,
                    message: "Задание не найдено",
                });
            }

            const taskTitle = `${task.title}`;

            await task.destroy();

            return res.status(200).json({
                success: true,
                message: `Задание ${taskTitle} успешно удалено`,
            });
        } catch (error) {
            console.error("Ошибка удаления задания:", error);

            return res.status(500).json({
                success: false,
                message: "Внутренняя ошибка сервера при удалении",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
}
export default new TaskController();
