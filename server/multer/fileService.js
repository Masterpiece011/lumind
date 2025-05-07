import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { fileConfig } from "./multerConfig.js";
import { sanitizeFilename } from "./encodingUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileService {
    /**
     * Перемещает файл из временной директории в постоянную
     */
    static async promoteTempFile(tempPath, targetDir, newFilename = null) {
        try {
            const filename = newFilename || path.basename(tempPath);
            const safeFilename = sanitizeFilename(filename);
            const destination = path.join(
                fileConfig.UPLOADS_BASE_DIR,
                targetDir,
                safeFilename
            );

            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.rename(tempPath, destination);

            return {
                success: true,
                path: destination,
                relativePath: path.join(targetDir, safeFilename),
            };
        } catch (error) {
            console.error(`File promotion failed: ${error.message}`);
            return { success: false, error };
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
