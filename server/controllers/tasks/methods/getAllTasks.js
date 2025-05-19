import { Op } from "sequelize";

import { Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllTasks(req, res, next) {
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

        return ApiError.internal("Ошибка получения заданий");
    }
}
