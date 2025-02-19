const express = require("express");
const upload = require("../multer/multerConfig");
const router = express.Router();

router.post("/file", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Файл не был загружен" });
    }
    res.json({ message: "Файл успешно загружен", filePath: req.file.path });
});

router.post("/files", upload.array("files", 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Файлы не были загружены" });
    }
    res.json({
        message: "Файлы успешно загружены",
        files: req.files.map((f) => f.path),
    });
});

module.exports = router;
