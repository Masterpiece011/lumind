import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createPublication(req, res, next) {
    try {
        const { title, content, description, creator_id, team_id } = req.body;

        if (!title && !creator_id && !team_id) {
            return next(
                ApiError.badRequest(
                    "Необхоидмо указывать заголовок, ID создателя, и ID команды"
                )
            );
        }

        const publication = await Publications.create({
            team_id: team_id,
            title: title,
            content: content || "",
            description: description || "",
            creator_id: creator_id,
        });

        return res.json({
            message: "Публикация успешно создана",
            publication: publication,
        });
    } catch (error) {
        console.log("Ошибка создания публикации", error);

        return ApiError.badRequest("Ошибка создания публикации");
    }
}
