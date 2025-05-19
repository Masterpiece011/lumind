import { Roles, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updateUser(req, res, next) {
    try {
        const {
            user_id,
            first_name,
            middle_name,
            last_name,
            display_name,
            group_id,
            role_name,
            img_url,
        } = req.body;

        // Находим пользователя
        const user = await Users.findOne({
            where: { id: user_id },
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return ApiError.badRequest("Пользователь не найден");
        }

        // Находим роль, если она указана
        let roleId = user.role_id;
        if (role_name) {
            const role = await Roles.findOne({
                where: { name: role_name },
            });
            if (!role) {
                return ApiError.badRequest("Указанная роль не найдена");
            }
            roleId = role.id;
        }

        // Обновляем данные пользователя
        await user.update({
            first_name: first_name || user.first_name,
            middle_name: middle_name || user.middle_name,
            last_name: last_name || user.last_name,
            display_name: display_name || user.display_name,
            group_id: group_id || user.group_id,
            role_id: roleId, // Используем обновленный или старый role_id
            img: img_url || user.img,
        });

        // Формируем ответ
        return res.status(200).json({
            success: true,
            data: user,
            message: "Пользователь успешно обновлен",
        });
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);

        return ApiError.badRequest("Ошибка обновления пользователя");
    }
}
