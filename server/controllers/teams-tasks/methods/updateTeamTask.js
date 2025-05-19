import { Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updateTeamTask(req, res, next) {
    try {
        const { team_id, user_id } = req.body;

        if (!team_id || !user_id) {
            return ApiError.badRequest(
                `Невозможно обновить связку команды и задания: ${error.message}`
            );
        }

        await Teams_Tasks.update(
            { where: { team_id: team_id, user_id: user_id } },
            {
                title: title,
                description: description || "",
                creator_id: creator_id,
            }
        );

        return res.json({
            message: "Связка команды и задания успешно обновлена",
        });
    } catch (e) {
        return ApiError.internal("Ошибка обновления связки команды и задания");
    }
}
