import { json } from "sequelize";

import { Roles } from "../models/models.js";

import * as ROLES from "../rolesConfing.js";

import jwt from "jsonwebtoken";

class RoleController {
    async create(req, res) {
        try {
            const { role_name } = req.body;

            const cookieToken = req.cookies.token;

            const decoded = jwt.verify(cookieToken, process.env.SECRET_KEY);
            req.user = decoded;

            if (req.user.role.name !== ROLES.ADMIN) {
                return res
                    .status(403)
                    .json({ message: "Нет доступа для создания роли" });
            }

            if (!role_name) {
                return res.status(400).json({
                    message: "Ошибка при создании роли: имя роли не указано",
                });
            }
            const roles = await Roles.findAll({
                where: {
                    name: role_name,
                },
            });

            if (roles.length > 0) {
                return res.status(400).json({
                    message:
                        "Ошибка при создании роли: такая роль уже существует",
                });
            }

            const role = await Roles.create({ name: role_name });
            return res.json({ role: role });
        } catch (error) {
            return res.status(500).json({ message: "Server error" });
        }
    }

    async getAll(req, res) {
        try {
            const roles = await Roles.findAll();
            return res.json({ roles: roles });
        } catch (error) {
            console.log("Ошибка получения ролей", error);
            return res.json({ message: "Ошибка получения ролей" });
        }
    }
}

export default new RoleController();
