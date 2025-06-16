import createChat from "./methods/createChat.js";
import deleteChatForUser from "./methods/deleteChatForUser.js";
import getAllChats from "./methods/getAllChats.js";
import getAllUserChats from "./methods/getAllUserChats.js";
import getChatHistory from "./methods/getChatHistory.js";

class ChatController {
    // Создание чата

    createChat = createChat;

    // Получение всех чатов

    getAllChats = getAllChats;

    // Получение истории сообщений ОДНОГО чата

    getChatHistory = getChatHistory;

    // Получение всех чатов пользователя

    getAllUserChats = getAllUserChats;

    // Удаление чата для пользователя

    deleteChatForUser = deleteChatForUser;

    // ИЗМЕНЕНИЕ типа чата

    // changeChatType = changeChatType;
}

export default new ChatController();
