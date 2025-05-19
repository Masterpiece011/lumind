import registration from "./methods/registration.js";
import login from "./methods/login.js";
import check from "./methods/check.js";
import getAllUsers from "./methods/getAllUsers.js";
import getOneUser from "./methods/getOneUser.js";
import updateUser from "./methods/updateUser.js";
import deleteUser from "./methods/deleteUser.js";



class UserController {
    // Регистрация пользователя (доступна только АДМИНАМ и МОДЕРАТОРАМ)

    registration = registration;

    // Авторизация пользователя

    login = login;

    // Проверка формирования токена

    check = check;

    // Получение всех пользователей

    getAll = getAllUsers;

    // Получение одного пользователя по ID

    getOne = getOneUser;

    // Обновление пользователя

    update = updateUser;

    // Удаление пользователя

    delete = deleteUser;
}
export default new UserController();
