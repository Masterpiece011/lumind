import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import * as models from "./models/models.js";
import router from "./routes/index.js";
import ErrorHandlingMiddleware from "./middleware/ErrorHandlingMiddleware.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url"; // Импортируем fileURLToPath
import expressWs from "express-ws";

// Получаем текущий путь к файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const WSServer = expressWs(app);
const aWss = WSServer.getWss();

import sequelize from "./db.js";
import uploadRoutes from "./routes/uploadRouter.js";

const PORT = process.env.PORT || 8080;

import { MESSAGES, ACTIONS } from "./ws/index.js";

// Middleware
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
app.use(fileUpload());
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Роуты
app.use("/api", router);
app.use("/upload", uploadRoutes);

// Обработка ошибок
app.use(ErrorHandlingMiddleware);

// WebSocket
app.ws("/", (ws, req) => {
    console.log("ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО");
    ws.send("Ты успешно подключился");
    ws.on("message", (msg) => {
        try {
            msg = JSON.parse(msg);
            switch (msg.method) {
                case MESSAGES.CONNECTION:
                    ACTIONS.connectionHandler();
                    break;
                case MESSAGES.UPDATE_CHATS:
                    ACTIONS.connectionHandler(ws, msg);
                    ACTIONS.broadcastConnection(ws, msg, aWss);
                    break;
                case MESSAGES.UPDATE_CHAT_MESSAGES:
                    ACTIONS.connectionHandler(ws, msg);
                    ACTIONS.broadcastConnection(ws, msg, aWss);
                    break;
                default:
                    break;
            }
            console.log(msg); // Убрал JSON.parse, так как msg уже парсится
        } catch (error) {
            console.error("Ошибка при обработке сообщения WebSocket:", error);
        }
    });
});

// Запуск сервера
const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (e) {
        console.error("Ошибка при запуске сервера:", e);
    }
};

start();