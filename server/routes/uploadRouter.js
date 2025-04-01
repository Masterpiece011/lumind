import express from "express";

const uploadRoutes = express.Router();

import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
import upload from "../multer/multerConfig.js";

// Получаем текущий путь к файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

uploadRoutes.post("/file", (req, res, next) => {
    console.log("Начало загрузки файла");

    upload.single("file")(req, res, function (err) {
        if (err) {
            console.error("Multer error:", err);
            return res.status(500).json({ error: "Ошибка загрузки файла" });
        }

        console.log("Файл получен:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "Файл не был загружен" });
        }

        res.json({ message: "Файл успешно загружен", filePath: req.file.path });
    });
});

uploadRoutes.post("/files", upload.array("files", 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Файлы не были загружены" });
    }
    res.json({
        message: "Файлы успешно загружены",
        files: req.files.map((f) => f.path),
    });
});

uploadRoutes.get("/download", (req, res) => {
    try {
        let filePath = req.query.path.replace(/\\/g, "/");

        if (!filePath.startsWith("uploads/")) {
            filePath = "uploads/" + filePath;
        }

        const absolutePath = path.join(__dirname, "..", filePath);

        if (!fs.existsSync(absolutePath)) {
            return res
                .status(404)
                .json({ error: "Файл не найден: " + absolutePath });
        }

        res.download(absolutePath, path.basename(filePath), (err) => {
            if (err) {
                console.error("Download error:", err);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: "Ошибка при скачивании файла",
                    });
                }
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

export default uploadRoutes;
