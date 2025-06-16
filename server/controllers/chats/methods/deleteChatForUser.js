import { Chats } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function deleteChatForUser(req, res, next) {
    try {
        const { page = 1, quantity = 20 } = req.body;

        const { rows: chats, count } = await Chats.findAndCountAll();

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
