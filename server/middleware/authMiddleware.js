import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export default function (req, res, next) {
    // console.log("Auth Middleware Triggered"); // Логирование для отладки
    // console.log("Request Headers:", req.headers); // Логирование всех заголовков

    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        // Извлечение токена из cookies
        const token = req.cookies.token;

        if (!token) {
            console.log("No token found");
            return res.status(401).json({ message: "Не авторизован" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        // console.log("Decoded User:", req.user); // Логирование для отладки
        // console.log("Cookies:", req.cookies);
        // console.log("Token from cookies:", req.cookies.token);
        next();
    } catch (e) {
        return res.status(401).json({ message: "Не авторизован" });
    }
}
