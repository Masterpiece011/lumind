import createPublication from "./methods/createPublication.js";
import deletePublication from "./methods/deletePublication.js";
import getAllPublications from "./methods/getAllPublications.js";
import getOnePublication from "./methods/getOnePublication.js";
import getTeamPublications from "./methods/getTeamPublications.js";
import updatePublication from "./methods/updatePublication.js";

class PublicationController {
    // Создание публикации

    create = createPublication;

    // Обновление публикации

    update = updatePublication;

    // Удаление публикации

    delete = deletePublication;

    // Получение всех публикаций

    getAll = getAllPublications; // Пометка на удаление, возможно не пригодится

    // Получение всех публикаций команды

    getTeamPublications = getTeamPublications;

    // Получение одной публикации по ID

    getOne = getOnePublication;
}

export default new PublicationController();
