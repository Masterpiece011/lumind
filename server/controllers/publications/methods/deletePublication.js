import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deletePublication(req, res, next) {
    try {
        const { id } = req.params;

        console.log(id);

        await Publications.destroy({
            where: { id },
        });

        return res.json({ message: "Публикация успешно удалена" });
    } catch (error) {
        console.log("Ошибка удаления публикации:", error);
        return ApiError.badRequest("Ошибка удаления публикации");
    }
}
