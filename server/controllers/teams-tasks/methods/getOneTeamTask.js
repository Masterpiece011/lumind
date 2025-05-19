import { Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneTeamTask(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return ApiError.badRequest("Необходимо передать ID");
        }

        const user_team = await Teams_Tasks.findByPk(id, {
            attributes: { exclude: ["created_at", "updated_at"] },
        });

        if (user_team) {
            return ApiError.badRequest(
                "Связки команды с заданием не существует"
            );
        }

        return res.json({ data: user_team });
    } catch (error) {
        return ApiError.internal("Ошибка получения связки команды с заданием");
    }
}
