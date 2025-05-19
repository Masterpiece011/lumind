import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deletePublication(req, res, next) {
    try {
        const { publication_id } = req.body;

        await Publications.destroy({
            where: { publication_id },
        });

        return res.json({ message: "Публикация успешно удалена" });
    } catch (error) {
        console.log("Ошибка удаления публикации:", error);
        return ApiError.badRequest("Ошибка удаления публикации");
    }
}
