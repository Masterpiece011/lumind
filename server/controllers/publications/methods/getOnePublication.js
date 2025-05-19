import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOnePublication(req, res, next) {
    try {
        const { publication_id } = req.params;

        const publication = await Publications.findOne({
            where: { id: publication_id },
        });

        if (!publication) {
            return res.status(404).json({
                message: "Публикация не найдена",
            });
        }

        return res.json(group);
    } catch (error) {
        console.log("Ошибка получения публикации", error);

        return ApiError.internal("Ошибка получения публикации");
    }
}
