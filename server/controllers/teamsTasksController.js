import { json } from "sequelize";

import { Teams, Tasks, Teams_Tasks } from "../models/models.js";

import ApiError from "../error/ApiError.js";

class TeamsTasksController {
    // Создание связи команды с заданием

    async create(req, res) {
        try {
            const { team_id, task_id } = req.body;

            if (!team_id || !task_id) {
                return res.status(400).json({
                    success: false,
                    message: "Необходимо указать ID команды и задания",
                });
            }

            // Проверка существования команды и задания
            const [task, team] = await Promise.all([
                Tasks.findByPk(task_id),
                Teams.findByPk(team_id),
            ]);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Задание не найдено",
                });
            }

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Команда не найдена",
                });
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
            return res.status(500).json({
                message: "Ошибка создания связки команды с заданием",
            });
        }
    }

    // Получение всех связей команд и заданий

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
                where[Op.or] = [
                    { first_name: { [Op.iLike]: `%${search_text}%` } },
                    { last_name: { [Op.iLike]: `%${search_text}%` } },
                    { email: { [Op.iLike]: `%${search_text}%` } },
                    { display_name: { [Op.iLike]: `%${search_text}%` } },
                ];
            }

            // Нормализация параметра сортировки
            const normalizeOrder = (orderParam) => {
                if (
                    orderParam.toUpperCase() === "ASC" ||
                    orderParam.toUpperCase() === "DESC"
                ) {
                    return [["team_id", orderParam]];
                }

                if (typeof orderParam === "string") {
                    const [field, direction] = orderParam.split(":");
                    return [[field || "team_id", direction || "ASC"]];
                }

                if (Array.isArray(orderParam) && orderParam.length === 2) {
                    return [orderParam];
                }

                return [["team_id", "ASC"]];
            };

            const sequelizeOrder = normalizeOrder(order);

            const totalUsersTeams = await Teams_Tasks.count({ where });

            const teams_tasks = await Teams_Tasks.findAll({
                where,
                offset: offset,
                limit: quantity,
                order: sequelizeOrder,
                attributes: { exclude: ["created_at", "updated_at"] },
            });

            return res.json({ data: teams_tasks, total: totalUsersTeams });
        } catch (error) {
            console.log("Ошибка получения связок команд и заданий ", error);

            return res.status(500).json({
                message: "Ошибка получения связок команд с заданиями",
                error: error.message,
            });
        }
    }

    // Одной конкретной связки команды с заданием

    async getOne(req, res) {
        // Подумать может и не пригодится
        try {
            const { id } = req.params;

            if (!id) {
                return ApiError.badRequest("Необходимо передать ID");
            }

            const user_team = await Teams_Tasks.findByPk(id, {
                attributes: { exclude: ["created_at", "updated_at"] },
            });

            if (user_team) {
                return ApiError.badRequest(
                    "Связки команды с заданием не существует"
                );
            }

            return res.json({ data: user_team });
        } catch (error) {
            return res.status(500).json({
                message: "Ошибка получения связки команды с заданием",
                error: error.message,
            });
        }
    }

    // Обновление связи команды с заданием

    async update(req, res) {
        try {
            const { team_id, user_id } = req.body;

            if (!team_id || !user_id) {
                return ApiError.badRequest(
                    `Невозможно обновить связку команды и задания: ${error.message}`
                );
            }

            await Teams_Tasks.update(
                { where: { team_id: team_id, user_id: user_id } },
                {
                    title: title,
                    description: description || "",
                    creator_id: creator_id,
                }
            );

            return res.json({
                message: "Связка команды и задания успешно обновлена",
            });
        } catch (e) {
            return res.status(500).json({ messgae: "Server error" });
        }
    }

    // Удаление связи команды с заданием

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return ApiError.badRequest("Необходимо передать ID");
            }

            const task_team = await Teams_Tasks.findByPk(id);

            if (!task_team) {
                return res.status(404).json({
                    success: false,
                    message: "Связка команды и задания не найдена",
                });
            }

            await task_team.destroy();

            return res.json({
                message: "Связка команды и задания успешно удалена",
            });
        } catch (e) {
            return res.status(500).json({ messgae: "Server error" });
        }
    }
}

export default new TeamsTasksController();
