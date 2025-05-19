import { Teams, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updateTeam(req, res, next) {
    try {
        const { team_id, name, description } = req.body;

        // Найти команду по ID

        const team = await Teams.findByPk(team_id, {
            include: [
                {
                    model: Users,
                    attributes: [
                        "id",
                        "img",
                        "email",
                        "first_name",
                        "middle_name",
                        "last_name",
                        "role_id",
                    ],
                    through: { attributes: [] },
                },
            ],
        });

        if (!team) {
            return next(
                ApiError.badRequest("Команда с указанным ID не найдена")
            );
        }

        await team.update({
            name: name || team.name,
            description: description || team.description,
        });

        return res.json({
            message: "Команда успешно обновлена",
            team,
        });
    } catch (error) {
        next(ApiError.internal("Ошибка обновления команды: " + error.message));
    }
}
