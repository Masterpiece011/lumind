import { Chat_Members, Chats } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function getChatHistory(req, res, next) {
    try {
        const {
            chat_id,
            page = 1,
            quantity = 20,
            order = "ASC",
            search_query = "",
        } = req.body;

        if (!user_id) {
            return next(
                ApiError.badRequest("Необходимо передать ID пользователя")
            );
        }

        const { rows: chats, count } = await Chat_Members.findAndCountAll({
            where: user_id,
            attributes: { exclude: ["created_at", "updated_at"] },
            include: {
                model: Chats,
                as: "chat",
            },
        });

        if (!count) {
            return res.json({ chats: [], total: 0 });
        }

        return res.json({
            chats: chats,
            total: count,
        });
    } catch (error) {
        next(
            ApiError.internal(`Ошибка при получении заданий: ${error.message}`)
        );
    }
}
