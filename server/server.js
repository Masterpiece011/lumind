import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import * as models from "./models/models.js";
import router from "./routes/index.js";
import ErrorHandlingMiddleware from "./middleware/ErrorHandlingMiddleware.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import expressWs from "express-ws";

// Получаем текущий путь к файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const WSServer = expressWs(app);
const aWss = WSServer.getWss();
console.log("awss", aWss);

import sequelize from "./db.js";
import uploadRoutes from "./routes/uploadRouter.js";

const PORT = process.env.PORT || 8080;

import { MESSAGES, ACTIONS } from "./ws/index.js";

app.use(
    cors({
        origin: "http://localhost:3000", // URL вашего фронта
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Роуты
app.use("/api", router);
app.use("/upload", uploadRoutes);

// Обработка ошибок
app.use(ErrorHandlingMiddleware);

// WebSocket
app.ws("/", (ws, req) => {
    console.log("ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО");
    ws.send({ data: "Ты успешно подключился" });

    ws.on("message", (rawMsg) => {
        try {
            const msg = JSON.parse(rawMsg);
            console.log("Получено сообщение:", msg);

            switch (msg.method) {
                case MESSAGES.CONNECTION:
                    ACTIONS.connectionHandler(ws, msg);
                    break;

                case MESSAGES.UPDATE_CHATS:
                case MESSAGES.UPDATE_CHAT_MESSAGES:
                    // Только одна рассылка!
                    ACTIONS.broadcastConnection(msg, aWss);
                    break;

                default:
                    console.warn("Неизвестный метод:", msg.method);
            }
        } catch (error) {
            console.error("Ошибка обработки сообщения:", error);
        }
    });
});

// Запуск сервера
const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize
            .sync
            // { alter: true }  Внести в скобки если были изменения models
            ();

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (e) {
        console.error("Ошибка при запуске сервера:", e);
    }
};

start();
