import dotenv from "dotenv";
dotenv.config();

import createTask from "./methods/createTask.js";
import getAllTasks from "./methods/getAllTasks.js";
import getOneTask from "./methods/getOneTask.js";
import udpateTask from "./methods/updateTask.js";
import deleteTask from "./methods/deleteTask.js";

class TaskController {
    // Создание задания

    create = createTask;

    // Получение всех заданий

    getAll = getAllTasks;

    // Получение одного пользователя по ID

    getOne = getOneTask;

    // Обновление задания

    update = udpateTask;

    // Удаление задания

    delete = deleteTask;
}
export default new TaskController();
