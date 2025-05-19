import { Groups, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneGroup(req, res, next) {
    try {
        const { id } = req.params;

        const group = await Groups.findOne({
            where: { id },
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

        return res.json({ group: group });
    } catch (error) {
        console.log("Ошибка при получении группы:", error);

        return ApiError.internal("Ошибка при получении группы");
    }
}
