import ApiError from "../../../error/ApiError.js";

import FileService from "../../../multer/fileService.js";

export default async function deleteFile(req, res, next) {
    try {
        const filePath = path.join(
            fileConfig.UPLOADS_BASE_DIR,
            req.params.path
        );
        const result = await FileService.delete(filePath);

        if (!result.success) {
            throw ApiError.internal("Ошибка удаления файла");
        }

        res.json({ success: true });
    } catch (error) {
        next(ApiError.internal("Ошибка удаления файла"));
    }
}
