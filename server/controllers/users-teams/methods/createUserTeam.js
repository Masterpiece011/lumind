import { Teams, Users, Users_Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function createUserTeam(req, res, next) {
    try {
        const { team_id, user_id } = req.body;

        if (!team_id || !user_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать ID команды и пользователя"
                )
            );
        }

        // Проверка существования пользователя и команды
        const [user, team] = await Promise.all([
            Users.findByPk(user_id),
            Teams.findByPk(team_id),
        ]);

        if (!user) {
            return next(ApiError.notFound("Пользователь не найден"));
        }

        if (!team) {
            return next(ApiError.notFound("Команда не найдена"));
        }

        // Проверка на существующую связь
        const existingLink = await Users_Teams.findOne({
            where: { team_id, user_id },
        });

        if (existingLink) {
            return next(
                ApiError.badRequest("Пользователь уже состоит в этой команде")
            );
        }

        // Создание связи
        const user_team = await Users_Teams.create({ team_id, user_id });

        return res.status(201).json({
            success: true,
            data: user_team,
            message: "Пользователь успешно добавлен в команду",
        });
    } catch (error) {
        console.error("Ошибка создания связки:", error);

        return next(
            ApiError.internal("Ошибка создания связки пользователя с командой")
        );
    }
}
