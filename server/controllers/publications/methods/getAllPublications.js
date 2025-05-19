import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllPublications(req, res, next) {
    try {
        const { group_id } = req.body;

        const publications = await Publications.findAll({
            where: { group_id: group_id },
        });

        return res.json({ publications: publications });
    } catch (error) {
        console.log("Ошибка получения публикаций", error);
        return ApiError.internal("Ошибка получения публикаций");
    }
}
