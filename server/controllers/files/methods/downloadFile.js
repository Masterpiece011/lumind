import ApiError from "../../../error/ApiError.js";
import path from "path";
import fs from "fs/promises";
import { Files } from "../../../models/models.js";
import { fileConfig } from "../../../multer/multerConfig.js";

export default async function downloadFile(req, res, next) {
    try {
        const fileId = req.params.id;
        const file = await Files.findByPk(fileId);

        if (!file) {
            throw ApiError.notFound("File not found");
        }

        const filePath = path.join(
            fileConfig.UPLOADS_BASE_DIR,
            file.file_url.replace(/^\/uploads\//, "")
        );

        if (
            !(await fs
                .access(filePath)
                .then(() => true)
                .catch(() => false))
        ) {
            throw ApiError.notFound("File not found on server");
        }

        // Устанавливаем правильные заголовки
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${file.original_name}"`
        );
        res.download(filePath, file.original_name);
    } catch (error) {
        next(error);
    }
}
