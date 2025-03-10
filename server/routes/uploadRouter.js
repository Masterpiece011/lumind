import express from "express";

import upload from "../multer/multerConfig.js";

const uploadRoutes = express.Router();

uploadRoutes.post("/file", (req, res, next) => {
    upload.single("file")(req, res, function (err) {
        if (err) {
            console.error("Multer error:", err);
            return res.status(500).json({ error: "Ошибка загрузки файла" });
        }
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

export default uploadRoutes;
