import { Groups } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteGroup(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) return;

        const group = await Groups.findByPk(id);

        if (!group) {
            return ApiError.badRequest("Группа не найдена");
        }

        const groupTitle = group.title;

        await group.destroy();

        return res.status(200).json({
            success: true,
            message: `Группа "${groupTitle}" (id: ${id}) успешно удалена`,
        });
    } catch (e) {
        return ApiError.internal("Ошибка удаления группы");
    }
}
