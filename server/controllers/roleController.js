const { json } = require("sequelize");
const { Roles } = require("../models/models");
const ROLES = require("../rolesConfing");

class RoleController {
    async create(req, res) {
        try {
            const { role_name } = req.body;

            if (req.user.role !== ROLES.ADMIN) {
                return res
                    .status(403)
                    .json({ message: "Нет доступа для создания роли" });
            }

            if (!role_name) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Ошибка при создании роли: имя роли не указано",
                    });
            }
            const role = await Roles.create({ name: role_name });
            return res.json(role);
        } catch (error) {
            return res.status(500).json({ message: "Server error" });
        }
    }

    async getAll(req, res) {
        try {
            const roles = await Roles.findAll();
            return res.json({roles: roles});
        } catch (error) {
            console.log("Ошибка получения ролей", error);
            return res.json({message: "Ошибка получения ролей"})
        }
    }
}

module.exports = new RoleController();
