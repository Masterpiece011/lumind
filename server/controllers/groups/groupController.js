import createGroup from "./methods/createGroup.js";
import getAllGroups from "./methods/getAllGroups.js";
import getOneGroup from "./methods/getOneGroup.js";
import updateGroup from "./methods/udpateGroup.js";
import deleteGroup from "./methods/deleteGroup.js";

class GroupController {
    // Создание группы

    create = createGroup;

    // Получение всех групп

    getAll = getAllGroups;

    // Получение одной группы

    getOne = getOneGroup;

    // Обновление группы

    update = updateGroup;

    // Удаление группы

    delete = deleteGroup;
}

export default new GroupController();
