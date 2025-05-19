import { Users_Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function getAllUsersTeams(req, res, next) {
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

        return ApiError.internal(
            "Ошибка получения связок пользователей с командами"
        );
    }
}
