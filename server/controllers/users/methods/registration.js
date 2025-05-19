import { Roles, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import * as ROLES from "../../../rolesConfing.js";

import { generateJwt } from "../utils/generateJwt.js";

import * as bcrypt from "bcrypt";

export default async function registration(req, res, next) {
    try {
        const { email, password, role, group_id, organization_id } = req.body;

        if (!email || !password) {
            return next(ApiError.badRequest("Некорректный email или password"));
        }
        const candidate = await Users.findOne({ where: { email: email } });

        if (candidate) {
            return next(
                ApiError.badRequest("Пользователь с таким email уже существует")
            );
        }
        const hashPassword = await bcrypt.hash(password, 5);

        const newUserRole = role || ROLES.USER;
        console.log("Requested Role:", newUserRole);

        const roleId = await Roles.findOne({ where: { name: newUserRole } });
        console.log("Found Role ID:", roleId);

        if (!roleId) {
            return next(ApiError.badRequest("Некорректная роль"));
        }

        const user = await Users.create({
            email,
            password: hashPassword,
            role_id: roleId.id,
            group_id: group_id,
            organization_id: organization_id,
        });

        const token = generateJwt(user.id, user.email, newUserRole);
        return res.json({ token });
    } catch (error) {
        console.log("Ошибка регистрации пользователя ", error);

        return ApiError.internal("Ошибка регистрации пользователя");
    }
}
