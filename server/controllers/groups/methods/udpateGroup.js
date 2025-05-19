import { Groups, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updateGroup(req, res, next) {
    try {
        const { group_id, title, description, creator_id } = req.body;

        if (!group_id) {
            return ApiError.badRequest("Необходимо ввести ID группы");
        }

        const group = await Groups.findOne({
            where: { id: group_id },
            include: [
                {
                    model: Users,
                    as: "users",
                    attributes: [
                        "id",
                        "first_name",
                        "middle_name",
                        "last_name",
                        "display_name",
                    ],
                },
            ],
            attributes: { exclude: ["created_at", "updated_at"] },
        });

        if (!group) {
            return ApiError.badRequest("Группа не найдена");
        }

        await group.update({
            title: title || group.title,
            description: description || group.description,
            creator_id: creator_id || group.creator_id,
        });

        // Формируем ответ
        return res.status(200).json({
            success: true,
            data: group,
            message: `Группа с id = ${group_id} успешно обновлена`,
        });
    } catch (e) {
        console.error(e);
        return ApiError.internal("Ошибка обновления группы");
    }
}
