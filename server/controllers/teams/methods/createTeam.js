import { Teams, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export default async function createTeam(req, res, next) {
    try {
        const { name, description, creator_id } = req.body;

        // Проверка обязательных полей

        if (!name || !creator_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать название команды и создателя"
                )
            );
        }

        // Проверка существования пользователя-создателя

        const creator = await Users.findByPk(creator_id);

        if (!creator) {
            return next(
                ApiError.badRequest("Создатель с указанным ID не найден")
            );
        }

        const avatar_color = getRandomColor();

        // Создание команды
        const team = await Teams.create({
            name,
            description,
            creator_id,
            avatar_color, // Добавляем цвет аватара
        });

        return res.json({
            message: "Команда успешно создана",
            team: team,
        });
    } catch (error) {
        next(
            ApiError.internal("Ошибка при создании команды: " + error.message)
        );
    }
}
