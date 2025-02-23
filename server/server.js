require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const models = require("./models/models");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
const WSServer = require("express-ws")(app);
const aWss = WSServer.getWss();
const sequelize = require("./db");
const uploadRoutes = require("./routes/uploadRouter.js");

const PORT = process.env.PORT || 8080;

// import { MESSAGES_TYPES, ACTIONS } from "./ws/index.js";
const { MESSAGES, ACTIONS } = require("./ws/index.js");

app.use(
    cors({
        origin: "http://localhost:3000", // Клиентский адрес
        credentials: true, // Если используются куки или токены
        methods: ["GET", "POST", "PUT", "DELETE"], // Разрешённые методы
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());

app.use(cookieParser());

app.use("/api", router);

app.use(errorHandler);

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/upload", uploadRoutes);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        app.ws("/", (ws, req) => {
            console.log("ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО");
            ws.send("Ты успешно подключился");
            ws.on("message", (msg) => {
                msg = JSON.parse(msg);
                switch (msg.method) {
                    case MESSAGES.CONNECTION:
                        ACTIONS.connectionHandler();
                        break;
                    case MESSAGES.UPDATE_CHATS:
                        connectionHandler(ws, msg);
                        break;
                    case MESSAGES.UPDATE_CHAT_MESSAGES:
                        connectionHandler(ws, msg);
                        break;

                    default:
                        break;
                }
                console.log(JSON.parse(msg));
            });
        });

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
};

start();
