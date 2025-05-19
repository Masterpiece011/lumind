import createRole from "./methods/createRole.js";
import getAllRoles from "./methods/getAllRoles.js";

class RoleController {
    // Создание роли

    create = createRole;

    // Получение всех ролей

    getAll = getAllRoles;
}

export default new RoleController();
