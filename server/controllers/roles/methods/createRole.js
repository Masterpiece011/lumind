import { Roles } from "../../../models/models.js";

import * as ROLES from "../../../rolesConfing.js";

import ApiError from "../../../error/ApiError.js";

import jwt from "jsonwebtoken";

export default async function createRole(req, res, next) {
    try {
        const { role_name } = req.body;

        const cookieToken = req.cookies.token;

        const decoded = JsonWebTokenError.verify(
            cookieToken,
            process.env.SECRET_KEY
        );
        req.user = decoded;

        if (req.user.role.name !== ROLES.ADMIN) {
            return ApiError.badRequest("Нет доступа для создания роли");
        }

        if (!role_name) {
            return ApiError.badRequest(
                "Ошибка при создании роли: имя роли не указано"
            );
        }
        const roles = await Roles.findAll({
            where: {
                name: role_name,
            },
        });

        if (roles.length > 0) {
            return ApiError.badRequest(
                "Ошибка при создании роли: такая роль уже существует"
            );
        }

        const role = await Roles.create({ name: role_name });

        return res.json({ role: role });
    } catch (error) {
        return ApiError.internal("Ошибка создания роли");
    }
}
