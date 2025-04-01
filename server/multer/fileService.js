import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { normalizeFilename, sanitizeFilename } from "./encodingUtils.js";

class FileService {
    static async moveFile(sourcePath, destinationPath) {
        return new Promise((resolve, reject) => {
            fs.rename(sourcePath, destinationPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(destinationPath);
                }
            });
        });
    }

    static async deleteFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    static async moveFilesFromTemp(tempPaths, baseUploadsDir) {
        const movedFiles = await Promise.all(
            tempPaths.map(async (tempPath) => {
                try {
                    const relativePath = path.relative(
                        path.resolve(__dirname, "..", "temp_uploads"),
                        tempPath
                    );

                    const dirname = path.dirname(relativePath);
                    let basename = path.basename(relativePath);

                    // Нормализуем имя файла перед перемещением
                    basename = normalizeFilename(basename);
                    basename = sanitizeFilename(basename);

                    // Сохраняем расширение файла
                    const ext = path.extname(basename);
                    const nameWithoutExt = path.basename(basename, ext);

                    // Создаем новое имя файла
                    const newBasename = nameWithoutExt + ext;
                    const newRelativePath = path.join(dirname, newBasename);
                    const destinationPath = path.join(
                        baseUploadsDir,
                        newRelativePath
                    );

                    // Создаем целевую директорию, если ее нет
                    const destinationDir = path.dirname(destinationPath);
                    if (!fs.existsSync(destinationDir)) {
                        fs.mkdirSync(destinationDir, { recursive: true });
                    }

                    // Перемещаем файл
                    await this.moveFile(tempPath, destinationPath);
                    return destinationPath;
                } catch (err) {
                    console.error("Ошибка перемещения файла:", err);
                    return null;
                }
            })
        );

        return movedFiles.filter((filePath) => filePath !== null);
    }

    static async cleanupTempFiles(tempPaths) {
        await Promise.all(
            tempPaths.map(async (tempPath) => {
                try {
                    await this.deleteFile(tempPath);
                } catch (err) {
                    console.error("Ошибка удаления временного файла:", err);
                }
            })
        );
    }
}

export default FileService;
