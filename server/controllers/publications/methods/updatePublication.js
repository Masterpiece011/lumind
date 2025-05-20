import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updatePublication(req, res, next) {
    try {
        const { publication_id, title, content, description } = req.body;

        if (!publication_id) {
            return next(
                ApiError.badRequest("Необходимо передать ID публикации")
            );
        }

        const publication = await Publications.findByPk(publication_id);

        if (!publication) {
            return next(ApiError.badRequest("Публикация не найдена"));
        }

        if (publication) {
            await publication.update({
                title: title || publication.title,
                content: content || publication.content,
                description: description || publication.description,
            });
        }
        return res.json({
            message: "Публикация успешно обновлена",
            publication,
        });
    } catch (error) {
        return ApiError.badRequest("Невозможно обновить публикацию");
    }
}
