import { Chats } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function changeChatType(req, res, next) {
    try {
        const { chat_id, new_members_ids = [] } = req.body;

        const chat = await Chats.findByPk(chat_id);

        return res.json({
            chats: chats,
            total: count,
        });
    } catch (error) {
        next(ApiError.internal(`Ошибка изменения чата: ${error.message}`));
    }
}
