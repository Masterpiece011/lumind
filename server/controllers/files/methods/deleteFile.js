import ApiError from "../../../error/ApiError.js";
import path from "path";

import { Files } from "../../../models/models.js";
import { fileConfig } from "../../../multer/multerConfig.js";
import FileService from "../../../multer/fileService.js";

export default async function deleteFile(req, res, next) {
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

        const deleteResult = await FileService.delete(filePath);
        if (!deleteResult.success) {
            throw ApiError.internal("File deletion failed");
        }

        await file.destroy();

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
}
