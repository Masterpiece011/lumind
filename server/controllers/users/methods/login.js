import dotenv from "dotenv";
dotenv.config();

import { Roles, Users } from "../../../models/models.js";

import bcrypt from "bcrypt";
import ApiError from "../../../error/ApiError.js";
import { generateJwt } from "../utils/generateJwt.js";

export default async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        // 1. Находим пользователя
        const user = await Users.findOne({
            where: { email },
            include: [{ model: Roles, attributes: ["name"] }],
        });

        if (!user) {
            return next(ApiError.internal("Пользователь не найден"));
        }

        // 2. Проверяем пароль
        let passwordValid;

        if (
            user.password.startsWith("$2a$") ||
            user.password.startsWith("$2b$")
        ) {
            // Пароль уже зашифрован
            passwordValid = bcrypt.compareSync(password, user.password);
        } else {
            // Пароль в открытом виде - сравниваем напрямую
            passwordValid = password === user.password;

            // Если пароль верный, хэшируем и сохраняем
            if (passwordValid) {
                const hashedPassword = bcrypt.hashSync(password, 5);
                await Users.update(
                    { password: hashedPassword },
                    { where: { id: user.id } }
                );
            }
        }

        if (!passwordValid) {
            return next(ApiError.internal("Неверный логин или пароль"));
        }

        // 3. Генерируем токен
        const token = generateJwt(user.id, user.email, user.role);

        // 4. Устанавливаем куки
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, token });
    } catch (error) {
        return next(ApiError.internal(`Ошибка авторизации: ${error.message}`));
    }
}
