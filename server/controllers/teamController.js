import dotenv from "dotenv";
dotenv.config();

import { Users, Teams, Users_Teams } from "../models/models.js";

import ApiError from "../error/ApiError.js";

const COLORS = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3C623",
    "#A233FF",
    "#FF33A8",
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

class TeamController {
    // Создание команды

    async create(req, res, next) {
        try {
            const { name, description, creator_id } = req.body;

            // Проверка обязательных полей

            if (!name || !creator_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать название команды и создателя"
                    )
                );
            }

            // Проверка существования пользователя-создателя

            const creator = await Users.findByPk(creator_id);

            if (!creator) {
                return next(
                    ApiError.badRequest("Создатель с указанным ID не найден")
                );
            }

            const avatar_color = getRandomColor();

            // Создание команды
            const team = await Teams.create({
                name,
                description,
                creator_id,
                avatar_color, // Добавляем цвет аватара
            });

            return res.json({
                message: "Команда успешно создана",
                team: team,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    "Ошибка при создании команды: " + error.message
                )
            );
        }
    }

    // Получение одной команды с пользователями

    async getOne(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return ApiError.badRequest("Необходимо указать ID команды");
            }

            const team = await Teams.findOne({
                where: { id },
                include: [
                    {
                        model: Users,
                        as: "users",
                        attributes: [
                            "id",
                            "img",
                            "email",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "role_id",
                        ],
                        through: { attributes: [] },
                    },
                ],
                attributes: {
                    exclude: ["created_at", "updated_at"],
                },
            });

            if (!team) {
                return next(
                    ApiError.notFound(
                        `Команда с указанным ID: ${id} не найдена`
                    )
                );
            }

            const teamCreator = await Users.findByPk(team.creator_id);

            if (!teamCreator) {
                return next(
                    ApiError.notFound(`Не может быть команды без создателя`)
                );
            }

            const teamData = {
                id: team.id,
                name: team.name,
                description: team.description,
                creator: {
                    creator_id: teamCreator.id,
                    first_name: teamCreator.first_name,
                    last_name: teamCreator.last_name,
                    middle_name: teamCreator.middle_name,
                    display_name: teamCreator.display_name,
                    avatar: teamCreator.avatar,
                },
                users: team.users,
            };

            return res.json({
                team: teamData,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    "Ошибка при получении команды: " + error.message
                )
            );
        }
    }

    // Получение всех команд с пользователями и группами

    async getAll(req, res, next) {
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
                where[Op.or] = [{ name: { [Op.iLike]: `%${search_text}%` } }];
            }

            // Нормализация параметра сортировки
            const normalizeOrder = (orderParam) => {
                if (
                    orderParam.toUpperCase() === "ASC" ||
                    orderParam.toUpperCase() === "DESC"
                ) {
                    return [["name", orderParam]];
                }

                if (typeof orderParam === "string") {
                    const [field, direction] = orderParam.split(":");
                    return [[field || "name", direction || "ASC"]];
                }

                if (Array.isArray(orderParam) && orderParam.length === 2) {
                    return [orderParam];
                }

                return [["name", "ASC"]];
            };

            const sequelizeOrder = normalizeOrder(order);

            // Получаем общее количество пользователей
            const totalTeams = await Teams.count({ where });

            const teams = await Teams.findAll({
                where,
                attributes: { exclude: ["created_at", "updated_at"] },
                limit: quantity,
                offset: offset,
                order: sequelizeOrder,
                subQuery: false,
            });

            return res.json({ teams, total: totalTeams });
        } catch (error) {
            next(
                ApiError.internal(
                    "Ошибка при получении всех команд: " + error.message
                )
            );
        }
    }

    // Обновление данных команды

    async update(req, res, next) {
        try {
            const { team_id, name, description } = req.body;

            // Найти команду по ID

            const team = await Teams.findByPk(team_id, {
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "img",
                            "email",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "role_id",
                        ],
                        through: { attributes: [] },
                    },
                ],
            });

            if (!team) {
                return next(
                    ApiError.badRequest("Команда с указанным ID не найдена")
                );
            }

            await team.update({
                name: name || team.name,
                description: description || team.description,
            });

            return res.json({
                message: "Команда успешно обновлена",
                team,
            });
        } catch (error) {
            next(
                ApiError.internal("Ошибка обновления команды: " + error.message)
            );
        }
    }

    // Удаление команды

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(ApiError.badRequest("Необходимо указать ID"));
            }

            const team = await Teams.findByPk(id);

            if (!team) {
                return next(
                    ApiError.notFound("Команда с указанным ID не найдена")
                );
            }

            const teamName = team.name;

            await team.destroy();

            return res.json({ message: `Команда ${teamName} успешно удалена` });
        } catch (error) {
            next(
                ApiError.internal("Ошибка удаления команды: " + error.message)
            );
        }
    }
}

export default new TeamController();
