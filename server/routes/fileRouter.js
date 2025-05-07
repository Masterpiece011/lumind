import { Router } from "express";
const router = Router();

import fileController from "../controllers/fileController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import FileService from "../multer/fileService.js";
import { upload } from "../multer/multerConfig.js";

router.post("/user", authMiddleware, fileController.getUserFiles);
router.post("/team/:teamId", authMiddleware, fileController.getTeamFiles);
// Загрузка файла
router.post("/", upload.single("file"), fileController.upload);

// Скачивание файла
router.get("/:id", fileController.download);

// Удаление файла
router.delete("/:id", fileController.delete);

// Периодическая очистка временных файлов
// setInterval(() => FileService.cleanupTempFiles(), 24 * 60 * 60 * 1000);

export default router;
