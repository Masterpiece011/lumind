import { Users_Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function updateUserTeam(req, res, next) {
    try {
        const { id } = req.params;
        const { team_id, user_id } = req.body;

        if (!id) {
            return next(ApiError.badRequest("Необходимо передать ID связки"));
        }

        if (!team_id || !user_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать ID команды и пользователя"
                )
            );
        }

        const user_team = await Users_Teams.findByPk(id);
        if (!user_team) {
            return next(ApiError.notFound("Связка не найдена"));
        }

        // Проверка на дубликат
        const existingLink = await Users_Teams.findOne({
            where: {
                team_id,
                user_id,
                id: { [Op.ne]: id }, // Исключаем текущую запись
            },
        });

        if (existingLink) {
            return next(ApiError.badRequest("Такая связка уже существует"));
        }

        await user_team.update({ team_id, user_id });

        return res.json({
            success: true,
            message: "Связка успешно обновлена",
            data: user_team,
        });
    } catch (error) {
        console.error("Ошибка обновления связки:", error);

        return next(
            ApiError.internal(
                "Ошибка обновления связки пользователя с командой"
            )
        );
    }
}
