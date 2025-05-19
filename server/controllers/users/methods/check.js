import dotenv from "dotenv";
dotenv.config();

import ApiError from "../../../error/ApiError.js";

import { generateJwt } from "../utils/generateJwt.js";

export default async function check(req, res, next) {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const userRole = req.user.role;
        const token = generateJwt(userId, userEmail, userRole);

        return res.json({
            token: token,
            user: {
                id: userId,
                email: userEmail,
                role: userRole,
            },
        });
    } catch (error) {
        return next(ApiError.internal(`Ошибка проверки: ${error.message}`));
    }
}
