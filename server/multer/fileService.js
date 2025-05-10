import fs from "fs/promises";
import path from "path";
import { fileConfig } from "./multerConfig.js";
import { decodeFileName, safeFileName } from "./encodingUtils.js";

class FileService {
    /**
     * Перемещает файл из временной директории в постоянную
     */
    static async promoteTempFile(tempPath, targetDir, originalName) {
        try {
            // Декодируем имя и создаем безопасную версию
            const decodedName = decodeFileName(originalName);
            const safeName = safeFileName(decodedName);

            // Добавляем уникальный префикс
            const uniquePrefix =
                Date.now() + "-" + Math.random().toString(36).slice(2, 6);
            const finalName = `${uniquePrefix}_${safeName}`;

            // Создаем нормализованные пути (используем path.join для правильных слешей)
            const destDir = path.join(fileConfig.UPLOADS_BASE_DIR, targetDir);
            const destPath = path.join(destDir, finalName);

            // Создаем директорию и перемещаем файл
            await fs.mkdir(destDir, { recursive: true });
            await fs.rename(tempPath, destPath);

            // Возвращаем пути с нормализованными слешами
            return {
                success: true,
                path: destPath,
                relativePath: path
                    .join(targetDir, finalName)
                    .replace(/\\/g, "/"), // Заменяем \ на /
                originalName: decodedName,
            };
        } catch (error) {
            console.error("File processing error:", error);
            try {
                await fs.unlink(tempPath);
            } catch (cleanupError) {
                console.error("Cleanup failed:", cleanupError);
            }
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Удаляет файл или директорию
     */
    static async delete(pathToDelete) {
        try {
            const stat = await fs.stat(pathToDelete);

            if (stat.isDirectory()) {
                await fs.rm(pathToDelete, { recursive: true });
            } else {
                await fs.unlink(pathToDelete);
            }

            return { success: true };
        } catch (error) {
            if (error.code === "ENOENT") {
                return { success: true }; // Файл уже не существует
            }
            return { success: false, error };
        }
    }

    /**
     * Удаляет все файлы, связанные с сущностью
     */
    static async deleteEntityFiles(entity, fileField) {
        if (!entity || !entity[fileField]?.length) {
            return { deleted: 0 };
        }

        const results = await Promise.all(
            entity[fileField].map(async (file) => {
                const result = await this.delete(file.file_url);
                return result.success ? 1 : 0;
            })
        );

        return { deleted: results.reduce((a, b) => a + b, 0) };
    }

    /**
     * Очищает временные файлы старше 24 часов
     */
    static async cleanupTempFiles() {
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000; // 24 часа назад

        async function cleanDirectory(dirPath) {
            try {
                const files = await fs.readdir(dirPath);

                await Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(dirPath, file);
                        const stat = await fs.stat(filePath);

                        if (stat.mtimeMs < cutoff) {
                            await this.delete(filePath);
                        }
                    })
                );
            } catch (error) {
                if (error.code !== "ENOENT") {
                    console.error(
                        `Cleanup error in ${dirPath}: ${error.message}`
                    );
                }
            }
        }

        await cleanDirectory(fileConfig.TEMP_UPLOADS_DIR);
    }
}

export default FileService;
