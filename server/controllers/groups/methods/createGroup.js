import { Groups } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createGroup(req, res, next) {
    try {
        const { title, description, creator_id } = req.body;

        if (!title || !creator_id) {
            return ApiError.badRequest(
                "Нельзя создать группу без названия или создателя"
            );
        }

        console.log(title, description, creator_id);

        const group = await Groups.create({
            title,
            description: description || "",
            creator_id,
        });

        return res.json(group);
    } catch (error) {
        return ApiError.internal("Ошибка созадния группы");
    }
}
