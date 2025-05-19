import ApiError from "../../../error/ApiError.js";

import fs from "fs/promises";

export default async function downloadFile(req, res, next) {
    try {
        const filePath = path.join(
            fileConfig.UPLOADS_BASE_DIR,
            req.params.path
        );

        if (
            !(await fs
                .access(filePath)
                .then(() => true)
                .catch(() => false))
        ) {
            throw ApiError.notFound("File not found");
        }

        res.download(filePath);
    } catch (error) {
        next(ApiError.internal("Ошибка скачания файла"));
    }
}
