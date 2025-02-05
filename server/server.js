require("dotenv").config();

const express = require("express");
const models = require("./models/models");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const WebSocket = require("ws");

const sequelize = require("./db");
const PORT = process.env.PORT || 8080;

app.use(
    cors({
        origin: "http://localhost:3000", // Клиентский адрес
        credentials: true, // Если используются куки или токены
        methods: ["GET", "POST", "PUT", "DELETE"], // Разрешённые методы
    })
);
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, "static")));

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
};

const wss = new WebSocket.Server({ port: 9000 });

wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
        wss.clients.forEach((client) => {
            client.send(msg);
        });
    });

    ws.on("error", (e) => {
        ws.send(e);
    });

    ws.send("WsServer started!");
});

start();
