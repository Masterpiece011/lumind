import { Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteUser(req, res, next) {
    try {
        const { id } = req.params; // Лучше брать ID из параметров URL

        if (!id) {
            return ApiError.badRequest("ID пользователя обязательно");
        }

        const user = await Users.findByPk(id);

        if (!user) {
            return ApiError.badRequest("Пользователь не найден");
        }

        const userName = `${user.first_name} ${user.last_name}`;

        await user.destroy();

        return res.status(200).json({
            success: true,
            message: `Пользователь ${userName} успешно удалён`,
        });
    } catch (error) {
        console.error("Ошибка удаления пользователя:", error);

        return ApiError.internal("Внутренняя ошибка сервера при удалении");
    }
}
