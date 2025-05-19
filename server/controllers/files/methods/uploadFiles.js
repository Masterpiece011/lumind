import { Files } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";
import FileService from "../../../multer/fileService.js";

export default async function uploadFiles(req, res, next) {
    try {
        if (!req.files?.length) {
            throw ApiError.badRequest("No files uploaded");
        }

        const entityType = req.headers["x-entity-type"] || "general";
        const entityId = parseInt(req.headers["x-entity-id"]);
        const userId = req.user.id;

        if (!entityId || isNaN(entityId)) {
            throw ApiError.badRequest("Valid Entity ID is required");
        }

        const filesToCreate = [];
        const errors = [];

        for (const file of req.files) {
            try {
                const result = await FileService.promoteTempFile(
                    file.path,
                    entityType,
                    file.originalname
                );

                if (!result.success) {
                    throw new Error(result.error);
                }

                filesToCreate.push({
                    file_url: `/uploads/${result.relativePath}`,
                    original_name: result.originalName, // Декодированное имя
                    size: file.size,
                    mime_type: file.mimetype,
                    entity_type: entityType,
                    entity_id: entityId,
                    user_id: userId,
                });
            } catch (fileError) {
                errors.push(fileError.message);

                await FileService.delete(file.path).catch(console.error);
            }
        }

        if (filesToCreate.length === 0) {
            throw ApiError.internal(`All files failed: ${errors.join(", ")}`);
        }

        const filesRecords = await Files.bulkCreate(filesToCreate);

        res.json({
            success: true,
            files: filesRecords.map((file) => ({
                id: file.id,
                file_url: file.file_url,
                original_name: file.original_name,
                size: file.size,
                mime_type: file.mime_type,
            })),
        });
    } catch (error) {
        console.error("Ошибка загрузки файлов на сервер: ", error);

        next(ApiError.internal("Ошибка загрузки файлов на сервер"));
    }
}
