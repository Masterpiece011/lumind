import { json } from "sequelize";

import { Teams, Users, Users_Teams } from "../models/models.js";

import ApiError from "../error/ApiError.js";

class UsersTeamsController {
    // Создание связи группы с пользователями
    async create(req, res, next) {
        try {
            const { team_id, user_id } = req.body;

            if (!team_id || !user_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать ID команды и пользователя"
                    )
                );
            }

            // Проверка существования пользователя и команды
            const [user, team] = await Promise.all([
                Users.findByPk(user_id),
                Teams.findByPk(team_id),
            ]);

            if (!user) {
                return next(ApiError.notFound("Пользователь не найден"));
            }

            if (!team) {
                return next(ApiError.notFound("Команда не найдена"));
            }

            // Проверка на существующую связь
            const existingLink = await Users_Teams.findOne({
                where: { team_id, user_id },
            });

            if (existingLink) {
                return next(
                    ApiError.badRequest(
                        "Пользователь уже состоит в этой команде"
                    )
                );
            }

            // Создание связи
            const user_team = await Users_Teams.create({ team_id, user_id });

            return res.status(201).json({
                success: true,
                data: user_team,
                message: "Пользователь успешно добавлен в команду",
            });
        } catch (error) {
            console.error("Ошибка создания связки:", error);
            return next(
                ApiError.internal(
                    "Ошибка создания связки пользователя с командой"
                )
            );
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

    // Получение одной связки
    async getOne(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(ApiError.badRequest("Необходимо передать ID"));
            }

            const user_team = await Users_Teams.findByPk(id, {
                include: [
                    {
                        model: Users,
                        attributes: ["id", "first_name", "last_name", "email"],
                    },
                    {
                        model: Teams,
                        attributes: ["id", "name"],
                    },
                ],
            });

            if (!user_team) {
                return next(ApiError.notFound("Связка не найдена"));
            }

            return res.json({
                success: true,
                data: user_team,
            });
        } catch (error) {
            console.error("Ошибка получения связки:", error);
            return next(
                ApiError.internal(
                    "Ошибка получения связки пользователя с командой"
                )
            );
        }
    }

    // Обновление связи
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { team_id, user_id } = req.body;

            if (!id) {
                return next(
                    ApiError.badRequest("Необходимо передать ID связки")
                );
            }

            if (!team_id || !user_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать ID команды и пользователя"
                    )
                );
            }

            const user_team = await Users_Teams.findByPk(id);
            if (!user_team) {
                return next(ApiError.notFound("Связка не найдена"));
            }

            // Проверка на дубликат
            const existingLink = await Users_Teams.findOne({
                where: {
                    team_id,
                    user_id,
                    id: { [Op.ne]: id }, // Исключаем текущую запись
                },
            });

            if (existingLink) {
                return next(ApiError.badRequest("Такая связка уже существует"));
            }

            await user_team.update({ team_id, user_id });

            return res.json({
                success: true,
                message: "Связка успешно обновлена",
                data: user_team,
            });
        } catch (error) {
            console.error("Ошибка обновления связки:", error);
            return next(
                ApiError.internal(
                    "Ошибка обновления связки пользователя с командой"
                )
            );
        }
    }

    // Удаление связи
    async delete(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(ApiError.badRequest("Необходимо передать ID"));
            }

            const user_team = await Users_Teams.findByPk(id);
            if (!user_team) {
                return next(ApiError.notFound("Связка не найдена"));
            }

            await user_team.destroy();

            return res.json({
                success: true,
                message: "Связка успешно удалена",
            });
        } catch (error) {
            console.error("Ошибка удаления связки:", error);
            return next(
                ApiError.internal(
                    "Ошибка удаления связки пользователя с командой"
                )
            );
        }
    }
}

export default new UsersTeamsController();
