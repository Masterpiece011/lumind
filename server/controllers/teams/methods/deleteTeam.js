import { Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteTeam(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return next(ApiError.badRequest("Необходимо указать ID"));
        }

        const team = await Teams.findByPk(id);

        if (!team) {
            return next(ApiError.notFound("Команда с указанным ID не найдена"));
        }

        const teamName = team.name;

        await team.destroy();

        return res.json({ message: `Команда ${teamName} успешно удалена` });
    } catch (error) {
        next(ApiError.internal("Ошибка удаления команды: " + error.message));
    }
}
