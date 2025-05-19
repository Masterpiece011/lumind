import { Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteTeamTask(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return ApiError.badRequest("Необходимо передать ID");
        }

        const task_team = await Teams_Tasks.findByPk(id);

        if (!task_team) {
            return ApiError.badRequest("Связка команды и задания не найдена");
        }

        await task_team.destroy();

        return res.json({
            message: "Связка команды и задания успешно удалена",
        });
    } catch (e) {
        return ApiError.internal("Ошибка удаления связки команды с заданием");
    }
}
