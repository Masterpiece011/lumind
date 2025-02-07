const connectionHandler = (ws, msg) => {
    ws.id = msg.id;
    broadcastConnection(ws, msg);
};

const broadcastConnection = (ws, msg) => {
    aWss.clients.forEach((client) => {
        if (client.id === msg.id) {
            client.send(`Пользователь ${msg.username} подключился`);
        }
    });
};

module.exports = {
    connectionHandler: connectionHandler,
    broadcastConnection: broadcastConnection,
};
