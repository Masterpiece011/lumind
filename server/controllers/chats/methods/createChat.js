import { Chats, Chat_Members } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createChat(req, res, next) {
    try {
        const { user_id, member_id } = req.body;

        if (!user_id && !member_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать ID пользователя и ID собеседника для создания чата"
                )
            );
        }
        const newChat = await Chats.create();

        await Chat_Members.create({ chat_id: newChat.id, user_id: user_id });
        await Chat_Members.create({ chat_id: newChat.id, user_id: member_id });

        return res.json({
            message: `Чат между пользователями по ID ${user_id} и ${member_id} успешно создан`,
        });
    } catch (error) {
        next(
            ApiError.internal(`Ошибка при получении заданий: ${error.message}`)
        );
    }
}
