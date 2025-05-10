import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { decodeFileName, safeFileName } from "./encodingUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация путей
const UPLOADS_BASE_DIR = path.resolve(__dirname, "..", "uploads");
const TEMP_UPLOADS_DIR = path.resolve(__dirname, "..", "temp_uploads");

// Создаем корневые директории при старте
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
};
[UPLOADS_BASE_DIR, TEMP_UPLOADS_DIR].forEach(ensureDirExists);

// Генерация безопасного имени файла
const generateFilename = (req, file) => {
    const normalized = decodeFileName(file.originalname);
    const safeName = safeFileName(normalized);
    const uniquePrefix =
        Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    return `${uniquePrefix}_${safeName}`;
};

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

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error(`Тип файла ${file.mimetype} не поддерживается`),
            false
        );
    }
    cb(null, true);
};

// Конфигурация Multer
export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const userId = String(req.user?.id || "anonymous");
                const fileType = file.mimetype.split("/")[0];
                let subDir = "general";

                if (fileType === "image") subDir = "images";
                if (fileType === "application") subDir = "documents";

                const destPath = path.join(TEMP_UPLOADS_DIR, userId, subDir);
                ensureDirExists(destPath);
                cb(null, destPath);
            } catch (err) {
                console.error("Directory creation error:", err);
                cb(err);
            }
        },
        filename: (req, file, cb) => {
            try {
                cb(null, generateFilename(req, file));
            } catch (err) {
                console.error("Filename generation error:", err);
                cb(err);
            }
        },
    }),
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 5,
    },
}).array("files");

export const fileConfig = {
    UPLOADS_BASE_DIR,
    TEMP_UPLOADS_DIR,
};
