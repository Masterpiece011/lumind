import createTeamTask from "./methods/createTeamTask.js";
import getAllTeamsTasks from "./methods/getAllTeamsTasks.js";
import getOneTeamTask from "./methods/getOneTeamTask.js";
import updateTeamTask from "./methods/updateTeamTask.js";
import deleteTeamTask from "./methods/deleteTeamTask.js";

class TeamsTasksController {
    // Создание связи команды с заданием

    create = createTeamTask;

    // Получение всех связей команд и заданий

    getAll = getAllTeamsTasks;

    // Одной конкретной связки команды с заданием

    getOne = getOneTeamTask;

    // Обновление связи команды с заданием

    update = updateTeamTask;

    // Удаление связи команды с заданием

    delete = deleteTeamTask;
}

export default new TeamsTasksController();
