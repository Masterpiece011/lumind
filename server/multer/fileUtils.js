import fs from "fs";

/**
 * Удаляет файлы, связанные с сущностью (например, заданием или отправкой).
 * @param {Object} entity - Сущность (задание или отправка), содержащая файлы.
 * @param {string} fileField - Название поля, содержащего файлы (например, "Submissions_investments").
 */
export const deleteEntityFiles = async (entity, fileField, baseDir) => {
    if (entity[fileField] && entity[fileField].length > 0) {
        console.log("Найдены файлы для удаления:", entity[fileField]);
        await Promise.all(
            entity[fileField].map(async (file) => {
                const filePath = file.file_url; // Используем абсолютный путь
                console.log("Попытка удаления файла по пути:", filePath);

                try {
                    await fs.promises.access(filePath, fs.constants.F_OK);
                    await fs.promises.unlink(filePath);
                    console.log(`Файл удален: ${filePath}`);
                } catch (err) {
                    console.error(`Ошибка удаления файла: ${filePath}`, err);
                }
            })
        );
    } else {
        console.log("Нет файлов для удаления или поле файла пустое.");
    }
};
