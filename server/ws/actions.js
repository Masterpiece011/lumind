import WebSocket from "ws";

export const connectionHandler = (ws, msg) => {
    // Устанавливаем ID только для текущего клиента
    ws.id = msg.id;
    console.log(`Клиент ${msg.id} подключен`);
};

export const broadcastConnection = (msg, aWss) => {
    if (!aWss?.clients) {
        console.error("WebSocket.Server не инициализирован");
        return;
    }

    console.log(`Широковещательная рассылка для ${aWss.clients.size} клиентов`);

    aWss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
};
