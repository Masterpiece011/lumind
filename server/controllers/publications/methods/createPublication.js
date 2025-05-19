import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createPublication(req, res, next) {
    try {
        const { title, content, description, creator_id } = req.body;

        await Publications.create({
            title: title,
            content: content,
            description: description,
            creator_id: creator_id,
        });

        return res.json({ message: "Публикация успешно создана" });
    } catch (error) {
        console.log("Ошибка создания публикации", error);
        return ApiError.badRequest("Ошибка создания публикации");
    }
}
