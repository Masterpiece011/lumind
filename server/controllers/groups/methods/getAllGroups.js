import { Op } from "sequelize";

import { Groups } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllGroups(req, res, next) {
    try {
        const {
            page = 1,
            quantity = 10,
            order = "ASC",
            search_text = "",
        } = req.body;

        // Рассчитываем смещение (offset)
        const offset = (page - 1) * quantity;

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

        const totalGroups = await Groups.count({ where });

        const sequelizeOrder = normalizeOrder(order);

        const groups = await Groups.findAll({
            limit: quantity,
            offset: offset,
            where: where,
            order: sequelizeOrder,
            attributes: { exclude: ["created_at", "updated_at"] },
        });

        return res.json({ groups: groups, total: totalGroups });
    } catch (error) {
        console.log("Ошибка получения групп: ", error);

        return ApiError.internal("Ошибка получения групп");
    }
}
