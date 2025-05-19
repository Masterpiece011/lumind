import { Teams, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllTeams(req, res, next) {
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
