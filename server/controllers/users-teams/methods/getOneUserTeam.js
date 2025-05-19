import { Teams, Users, Users_Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneUserTeam(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return next(ApiError.badRequest("Необходимо передать ID"));
        }

        const user_team = await Users_Teams.findByPk(id, {
            include: [
                {
                    model: Users,
                    attributes: ["id", "first_name", "last_name", "email"],
                },
                {
                    model: Teams,
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!user_team) {
            return next(ApiError.notFound("Связка не найдена"));
        }

        return res.json({
            success: true,
            data: user_team,
        });
    } catch (error) {
        console.error("Ошибка получения связки:", error);

        return next(
            ApiError.internal("Ошибка получения связки пользователя с командой")
        );
    }
}
