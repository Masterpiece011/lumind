import getUserFiles from "./methods/getUserFiles.js";
import getTeamFiles from "./methods/getTeamFiles.js";
import uploadFiles from "./methods/uploadFiles.js";
import downloadFile from "./methods/downloadFile.js";
import deleteFile from "./methods/deleteFile.js";

class FileController {
    // Получение файлов пользователя

    getUserFiles = getUserFiles;

    // Получение файлов команды

    getTeamFiles = getTeamFiles;

    // Загрузка файлов на сервер

    upload = uploadFiles;

    // Скачивание файла с сервера

    download = downloadFile;

    // Удаление файла с сервера и из БД

    delete = deleteFile;
}

export default new FileController();
