import dotenv from "dotenv";
dotenv.config();

import {
    Users,
    Teams,
    Tasks,
    Assignments,
    Users_Teams,
    Teams_Tasks,
    Files,
} from "../models/models.js";

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
            const { user_id } = req.query;

            if (!id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID команды")
                );
            }

            const team = await Teams.findOne({
                where: { id },
                include: [
                    {
                        model: Users,
                        as: "users",
                        attributes: ["id", "email", "first_name", "last_name"],
                        through: { attributes: [] },
                    },
                ],
            });

            if (!team) {
                return next(
                    ApiError.notFound(`Команда с ID: ${id} не найдена`)
                );
            }

            const userAssignments = await Assignments.findAll({
                where: {
                    user_id: team.users.map((user) => user.id),
                },
                include: [
                    {
                        model: Tasks,
                        include: [
                            {
                                model: Files,
                                where: { entity_type: "task" },
                                required: false,
                            },
                        ],
                    },
                    {
                        model: Files,
                        where: { entity_type: "assignment" },
                        required: false,
                    },
                ],
            });

            const uniqueTasks = [];
            const taskMap = new Map();

            userAssignments.forEach((assignment) => {
                if (assignment.task && !taskMap.has(assignment.task.id)) {
                    taskMap.set(assignment.task.id, true);
                    uniqueTasks.push({
                        ...assignment.task.get({ plain: true }),
                        assignments: userAssignments
                            .filter((a) => a.task_id === assignment.task_id)
                            .map((a) => ({
                                ...a.get({ plain: true }),
                                files: a.files,
                            })),
                    });
                }
            });

            const creator = await Users.findByPk(team.creator_id, {
                attributes: ["id", "first_name", "last_name", "display_name"],
            });

            const response = {
                id: team.id,
                name: team.name,
                description: team.description,
                creator: {
                    id: creator.id,
                    display_name: creator.display_name,
                },
                users: team.users,
                tasks: uniqueTasks,
            };

            return res.json({ team: response });
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
                user_id, // ID пользователя, чьи команды мы ищем
                page = 1,
                quantity = 10,
                order = "ASC",
                search_text = "",
            } = req.body;

            if (!user_id) {
                return next(ApiError.badRequest("Необходимо указать user_id"));
            }

            const offset = (page - 1) * quantity;

            // Базовые условия для поиска
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

            // Получаем команды пользователя через промежуточную таблицу
            const { count, rows: teams } = await Teams.findAndCountAll({
                where,
                attributes: {
                    exclude: ["created_at", "updated_at"],
                    include: [
                        // Можно добавить дополнительные атрибуты из промежуточной таблицы
                        // [sequelize.literal('"users_teams"."created_at"'), 'joined_at']
                    ],
                },
                include: [
                    {
                        model: Users, // Убедитесь, что модель Users импортирована
                        as: "users", // Должно соответствовать ассоциации в модели Teams
                        where: { id: user_id },
                        through: {
                            attributes: [], // Не включаем атрибуты промежуточной таблицы
                        },
                        required: true, // INNER JOIN вместо LEFT JOIN
                    },
                ],
                limit: quantity,
                offset: offset,
                order: sequelizeOrder,
                subQuery: false,
                distinct: true, // Важно для корректного подсчета с JOIN
            });

            const response = teams.map((team) => {
                return {
                    id: team.id,
                    name: team.name,
                    description: team.description,
                    avatar_color: team.avatar_color,
                    creator_id: team.creator_id,
                };
            });

            return res.json({
                teams: response,
                total: count,
            });
        } catch (error) {
            console.error("Ошибка при получении команд пользователя:", error);
            next(
                ApiError.internal(
                    "Ошибка при получении команд пользователя: " + error.message
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
