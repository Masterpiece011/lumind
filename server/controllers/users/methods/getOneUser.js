import { Groups, Roles, Teams, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneUser(req, res, next) {
    try {
        const { id } = req.params;

        const user = await Users.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: Groups,
                    as: "group", // Должно соответствовать ассоциации в модели
                    attributes: ["id", "title", "creator_id"],
                },
                {
                    model: Roles,
                    as: "role", // Должно соответствовать ассоциации в модели
                    attributes: ["name"],
                },
                {
                    model: Teams,
                    as: "teams",
                    through: { attributes: [] },
                },
            ],
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return ApiError.badRequest("Пользователь не найден");
        }

        const user_data = {
            id: user.id,
            img: user.img,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role.name,
            group: user.group,
            teams: user.teams,
        };

        return res.json({ user_data });
    } catch (error) {
        console.log("Не удалось найти пользователя", error);

        return ApiError.internal("Ошибка поиска пользователя");
    }
}
