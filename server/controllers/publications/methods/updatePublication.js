import { Publications } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updatePublication(req, res, next) {
    try {
        const { publication_id, title, content, description } = req.body;

        const publication = await Publications.findOne({
            where: { id: publication_id },
        });
        if (publication) {
            await publication.update({
                title: title,
                content: content,
                description: description,
            });
        }
        return res.json({ message: "Publication successfuly updated" });
    } catch (error) {
        return ApiError.badRequest("Not available to update publication");
    }
}
