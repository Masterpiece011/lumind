import createUserTeam from "./methods/createUserTeam.js";
import getAllUsersTeams from "./methods/getAllUsersTeams.js";
import getOneUserTeam from "./methods/getOneUserTeam.js";
import updateUserTeam from "./methods/udpateUserTeam.js";
import deleteUserTeam from "./methods/deleteUserTeam.js";

class UsersTeamsController {
    // Создание связи группы с пользователями

    create = createUserTeam;

    // Получение всех связей пользователей и команд

    getAll = getAllUsersTeams;

    // Получение одной связки

    getOne = getOneUserTeam;

    // Обновление связи

    update = updateUserTeam;

    // Удаление связи
    delete = deleteUserTeam;
}

export default new UsersTeamsController();
