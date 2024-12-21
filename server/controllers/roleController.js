const { json } = require("sequelize");
const { Roles } = require("../models/models");
const ROLES = require("../rolesConfing");

class RoleController {
    async create(req, res) {
        try {
            const { name } = req.body;

            if (req.user.role !== ROLES.ADMIN) {
                return res
                    .status(403)
                    .json({ message: "Нет доступа для создания роли" });
            }

            if (!name) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Ошибка при создании роли: имя роли не указано",
                    });
            }
            const role = await Roles.create({ name });
            return res.json(role);
        } catch (error) {
            return res.status(500).json({ message: "Server error" });
        }
    }

    async getAll(req, res) {
        try {
            const roles = await Roles.findAll();
            return res.json(roles);
        } catch (error) {
            console.log("Error fetching roles", error);
        }
    }
}

module.exports = new RoleController();
