const fs = require("fs");
const path = require("path");

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

                    const destinationPath = path.join(
                        baseUploadsDir,
                        relativePath
                    );

                    const destinationDir = path.dirname(destinationPath);
                    if (!fs.existsSync(destinationDir)) {
                        fs.mkdirSync(destinationDir, { recursive: true });
                    }

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

module.exports = FileService;
