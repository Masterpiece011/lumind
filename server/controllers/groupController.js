import { json } from "sequelize";

import { Op } from "sequelize";

import { Groups, Users } from "../models/models.js";

import ApiError from "../error/ApiError.js";

class GroupController {
    // Создание группы

    async create(req, res) {
        try {
            const { title, description, creator_id } = req.body;

            if (!title || !creator_id) {
                return res.status(400).json({
                    message: "Нельзя создать группу без названия или создателя",
                });
            }

            console.log(title, description, creator_id);

            const group = await Groups.create({
                title,
                description: description || "",
                creator_id,
            });

            return res.json(group);
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
            });
        }
    }

    async getAll(req, res) {
        try {
            const {
                page = 1,
                quantity = 10,
                order = "ASC",
                search_text = "",
            } = req.body;

            // Рассчитываем смещение (offset)
            const offset = (page - 1) * quantity;

            const where = {};
            if (search_text) {
                where[Op.or] = [{ title: { [Op.iLike]: `%${search_text}%` } }];
            }

            // Нормализация параметра сортировки
            const normalizeOrder = (orderParam) => {
                if (
                    orderParam.toUpperCase() === "ASC" ||
                    orderParam.toUpperCase() === "DESC"
                ) {
                    return [["title", orderParam]];
                }

                if (typeof orderParam === "string") {
                    const [field, direction] = orderParam.split(":");
                    return [[field || "title", direction || "ASC"]];
                }

                if (Array.isArray(orderParam) && orderParam.length === 2) {
                    return [orderParam];
                }

                return [["title", "ASC"]];
            };

            const totalGroups = await Groups.count({ where });

            const sequelizeOrder = normalizeOrder(order);

            const groups = await Groups.findAll({
                limit: quantity,
                offset: offset,
                where: where,
                order: sequelizeOrder,
                attributes: { exclude: ["created_at", "updated_at"] },
            });

            return res.json({ groups: groups, total: totalGroups });
        } catch (error) {
            console.log("Error fetchgin groups ", error);

            return res.status(500).json({
                message: "Ошибка при получении групп",
            });
        }
    }

    // Получение одной группы

    async getOne(req, res) {
        try {
            const { id } = req.params;

            const group = await Groups.findOne({
                where: { id },
                include: [
                    {
                        model: Users,
                        as: "users",
                        attributes: [
                            "id",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "display_name",
                        ],
                    },
                ],
                attributes: { exclude: ["created_at", "updated_at"] },
            });

            if (!group) {
                return res.status(404).json({
                    message: "Группа не найдена",
                });
            }

            return res.json({ group: group });
        } catch (error) {
            console.log("Ошибка при получении группы:", error);
            return res.status(500).json({
                message: "Ошибка при получении группы",
            });
        }
    }

    // Обновление группы

    async update(req, res) {
        const { group_id, title, description, creator_id } = req.body;
        try {
            if (!group_id) {
                return ApiError.badRequest("Необходимо ввести id группы");
            }

            const group = await Groups.findOne({
                where: { id: group_id },
                include: [
                    {
                        model: Users,
                        as: "users",
                        attributes: [
                            "id",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "display_name",
                        ],
                    },
                ],
                attributes: { exclude: ["created_at", "updated_at"] },
            });

            if (group) {
                await group.update({
                    title: title || group.title,
                    description: description || group.description,
                    creator_id: creator_id || group.creator_id,
                });

                // Формируем ответ
                return res.status(200).json({
                    success: true,
                    data: group,
                    message: `Группа с id = ${group_id} успешно обновлена`,
                });
            } else {
                return ApiError.badRequest("Группа не найдена");
            }
        } catch (e) {
            console.error(e);
            return ApiError.badRequest("Невозможно обновить группу");
        }
    }

    // Удаление группы

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id) return;

            const group = await Groups.findByPk(id);

            if (!group) {
                return ApiError.badRequest("Группа не найдена");
            }

            const groupTitle = group.title;

            await group.destroy();

            return res.status(200).json({
                success: true,
                message: `Группа "${groupTitle}" (id: ${id}) успешно удалена`,
            });
        } catch (e) {
            return ApiError.badRequest("Невозможно удалить группу");
        }
    }
}

export default new GroupController();
