import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url"; // Импортируем fileURLToPath

// Получаем текущий путь к файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_UPLOADS_DIR = path.resolve(__dirname, "..", "temp_uploads");

const createUploadDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user && req.user.id ? req.user.id : "anonymous";
        const fileType = file.mimetype.split("/")[0];

        let uploadPath = path.join(
            TEMP_UPLOADS_DIR,
            "users",
            userId,
            "uploads"
        );

        switch (fileType) {
            case "image":
                uploadPath = path.join(
                    TEMP_UPLOADS_DIR,
                    "users",
                    userId,
                    "profile"
                );
                break;
            case "application":
                uploadPath = path.join(
                    TEMP_UPLOADS_DIR,
                    "users",
                    userId,
                    "documents"
                );
                break;
            default:
                break;
        }

        createUploadDir(uploadPath);
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Неподдерживаемый тип файла"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter,
});

export default upload;