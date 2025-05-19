import dotenv from "dotenv";
dotenv.config();

import {
    Users,
    Teams,
    Tasks,
    Assignments,
    Users_Teams,
    Teams_Tasks,
    Files,
} from "../../models/models.js";

import ApiError from "../../error/ApiError.js";

const COLORS = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3C623",
    "#A233FF",
    "#FF33A8",
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

import createTeam from "./methods/createTeam.js";
import getOneTeam from "./methods/getOneTeam.js";
import getAllTeams from "./methods/getAllTeams.js";
import updateTeam from "./methods/updateTeam.js";
import deleteTeam from "./methods/deleteTeam.js";

class TeamController {
    // Создание команды

    create = createTeam;

    // Получение одной команды с пользователями

    getOne = getOneTeam;

    // Получение всех команд с пользователями и группами

    getAll = getAllTeams;

    // Обновление данных команды

    update = updateTeam;

    // Удаление команды

    delete = deleteTeam;
}

export default new TeamController();
