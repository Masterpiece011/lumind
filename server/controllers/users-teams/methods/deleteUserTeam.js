import { Users_Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteUserTeam(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return next(ApiError.badRequest("Необходимо передать ID"));
        }

        const user_team = await Users_Teams.findByPk(id);
        if (!user_team) {
            return next(ApiError.notFound("Связка не найдена"));
        }

        await user_team.destroy();

        return res.json({
            success: true,
            message: "Связка успешно удалена",
        });
    } catch (error) {
        console.error("Ошибка удаления связки:", error);

        return next(
            ApiError.internal("Ошибка удаления связки пользователя с командой")
        );
    }
}
