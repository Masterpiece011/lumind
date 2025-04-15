import { json } from "sequelize";

import { Teams, Users, Users_Teams } from "../models/models.js";

import ApiError from "../error/ApiError.js";

class UsersTeamsController {
    // Создание связи группы с пользователями

    async create(req, res) {
        try {
            const { team_id, user_id } = req.body;

            if (!team_id || !user_id) {
                return res.status(400).json({
                    success: false,
                    message: "Необходимо указать ID команды и пользователя",
                });
            }

            // Проверка существования пользователя и команды
            const [user, team] = await Promise.all([
                Users.findByPk(user_id),
                Teams.findByPk(team_id),
            ]);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Пользователь не найден",
                });
            }

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Команда не найдена",
                });
            }

            // Создание связи с обработкой уникальности
            const user_team = await Users_Teams.create(
                { team_id, user_id },
                { returning: true }
            );

            return res.status(201).json({
                success: true,
                data: user_team,
            });
        } catch (e) {
            return res.status(500).json({
                message: "Ошибка создания связки пользователя с командой",
            });
        }
    }

    // Получение всех связей пользователей и команд

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

            const totalUsersTeams = await Users_Teams.count({ where });

            const users_teams = await Users_Teams.findAll({
                where,
                offset: offset,
                limit: quantity,
                order: sequelizeOrder,
                attributes: { exclude: ["created_at", "updated_at"] },
            });

            return res.json({ data: users_teams, total: totalUsersTeams });
        } catch (error) {
            console.log("Error fetchgin users_teams ", error);

            return res.status(500).json({
                message: "Ошибка получения связок пользователей с командами",
                error: error.message,
            });
        }
    }

    // Одной конкретной связки пользователя с командой

    async getOne(req, res) {
        // Подумать может и не пригодится
        try {
            const { id } = req.params;

            if (!id) {
                return ApiError.badRequest("Необходимо передать ID");
            }

            const user_team = await Users_Teams.findByPk(id);

            return res.json({ data: user_team });
        } catch (error) {
            return res.status(500).json({
                message: "Ошибка получения связки пользователя с командой",
                error: error.message,
            });
        }
    }

    // Обновление связи группы с пользователями

    async update(req, res) {
        try {
            const { team_id, user_id } = req.body;

            if (!team_id || !user_id) {
                return ApiError.badRequest(
                    `Невозможно обновить связку пользователей и команд: ${error.message}`
                );
            }

            await Users_Teams.update(
                { where: { team_id: team_id, user_id: user_id } },
                {
                    title: title,
                    description: description || "",
                    creator_id: creator_id,
                }
            );

            return res.json({
                message: "Связка пользователя и команды успешно обновлена",
            });
        } catch (e) {
            return res.status(500).json({ messgae: "Server error" });
        }
    }

    // Удаление связи группы с пользователями

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return ApiError.badRequest("Необходимо передать ID");
            }

            const user_team = await Users_Teams.findByPk(id);

            if (!user_team) {
                return res.status(404).json({
                    success: false,
                    message: "Связка пользователя и команды не найдена",
                });
            }

            await user_team.destroy();

            return res.json({
                message: "Связка пользователя и команды успешно удалена",
            });
        } catch (e) {
            return res.status(500).json({ messgae: "Server error" });
        }
    }
}

export default new UsersTeamsController();
