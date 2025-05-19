import { Groups, Roles, Teams, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function getAllUsers(req, res, next) {
    try {
        const {
            page = 1,
            quantity = 10,
            order = "ASC",
            search_text = "",
            role = "",
            group_id = null,
        } = req.body;

        const offset = (page - 1) * quantity;

        const where = {};

        if (role) {
            where["$role.name$"] = role.toUpperCase();
        }

        if (group_id) {
            where.group_id = group_id;
        }

        if (search_text) {
            where[Op.or] = [
                { first_name: { [Op.iLike]: `%${search_text}%` } },
                { last_name: { [Op.iLike]: `%${search_text}%` } },
                { email: { [Op.iLike]: `%${search_text}%` } },
                { display_name: { [Op.iLike]: `%${search_text}%` } },
            ];
        }

        const normalizeOrder = (orderParam) => {
            if (
                orderParam.toUpperCase() === "ASC" ||
                orderParam.toUpperCase() === "DESC"
            ) {
                return [["display_name", orderParam]];
            }

            if (typeof orderParam === "string") {
                const [field, direction] = orderParam.split(":");
                return [[field || "display_name", direction || "ASC"]];
            }

            if (Array.isArray(orderParam) && orderParam.length === 2) {
                return [orderParam];
            }

            return [["last_name", "ASC"]];
        };

        const sequelizeOrder = normalizeOrder(order);

        const totalUsers = await Users.count({
            where,
            include: [
                {
                    model: Roles,
                    as: "role",
                    attributes: [],
                },
            ],
        });

        const users = await Users.findAll({
            where,
            include: [
                {
                    model: Groups,
                    as: "group",
                    attributes: ["id", "title"],
                },
                {
                    model: Roles,
                    as: "role",
                    attributes: ["name"],
                },
                {
                    model: Teams,
                    as: "teams",
                    through: { attributes: [] },
                },
            ],
            attributes: { exclude: ["password"] },
            limit: quantity,
            offset: offset,
            order: sequelizeOrder,
            subQuery: false,
        });

        // Формируем ответ
        const response = {
            data: users.map((user) => ({
                id: user.id,
                img: user.img,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                display_name: user.display_name,
                email: user.email,
                role: user.role.name,
                group: user.group
                    ? {
                          id: user.group.id,
                          title: user.group.title,
                      }
                    : null,
                teams: user.teams,
            })),
            total: totalUsers,
        };

        return res.json(response);
    } catch (error) {
        console.error("Ошибка получения пользователей: ", error);

        return ApiError.internal("Ошибка получения пользователей");
    }
}
