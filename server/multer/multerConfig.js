import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { normalizeFilename, sanitizeFilename } from "./encodingUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация путей
const UPLOADS_BASE_DIR = path.resolve(__dirname, "..", "uploads");
const TEMP_UPLOADS_DIR = path.resolve(__dirname, "..", "temp_uploads");

// Создание директорий при необходимости
const ensureDirExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
};

// Определение конечной директории для файлов
const getDestination = async (req, file) => {
    const userId = req.user?.id || "anonymous";
    const fileType = file.mimetype.split("/")[0];

    let subDir = "general";
    if (fileType === "image") subDir = "images";
    if (fileType === "application") subDir = "documents";

    const destPath = path.join(TEMP_UPLOADS_DIR, userId, subDir);
    await ensureDirExists(destPath);
    return destPath;
};

// Генерация безопасного имени файла
const generateFilename = (req, file) => {
    const normalized = normalizeFilename(file.originalname);
    const safeName = sanitizeFilename(normalized);
    const uniquePrefix =
        Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    return `${uniquePrefix}_${safeName}`;
};

// Конфигурация хранилища
const storage = multer.diskStorage({
    destination: getDestination,
    filename: (req, file, cb) => {
        cb(null, generateFilename(req, file));
    },
});

// Фильтрация файлов
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    cb(null, allowedTypes.includes(file.mimetype));
};

// Экспорт настроенного экземпляра Multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 5, // Максимум 5 файлов за раз
    },
});

// Вспомогательные методы
export const fileConfig = {
    UPLOADS_BASE_DIR,
    TEMP_UPLOADS_DIR,
};
