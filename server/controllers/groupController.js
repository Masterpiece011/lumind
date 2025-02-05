const { json } = require("sequelize");
const { Groups, Users, Users_Groups } = require("../models/models");
const ApiError = require("../error/ApiError");

class GroupController {
    // Создание группы

    async create(req, res) {
        try {
            const { title, creator_id } = req.body;

            if (!title || !creator_id) {
                return res.status(400).json({
                    message: "Нельзя создать группу без названия или создателя",
                });
            }
            const group = await Groups.create({
                title: title,
                creator_id: creator_id,
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
            const groups = await Groups.findAll({
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "first_name",
                            "middle_name",
                            "last_name",
                        ],
                        through: {
                            attributes: [],
                        },
                    },
                ],
            });
            return res.json({ groups: groups });
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
            const { group_id } = req.params;

            const group = await Groups.findOne({
                where: { id: group_id },
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "first_name",
                            "middle_name",
                            "last_name",
                        ],
                        through: {
                            attributes: [],
                        },
                    },
                ],
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
        const { group_id, title, users } = req.body;
        try {
            const group = await Groups.findOne({
                where: { id: group_id },
                include: Users,
            });

            if (group) {
                await group.update({ title: title });

                if (users) {
                    const usersArray = Array.isArray(users) ? users : [users];

                    await group.addUsers(usersArray);

                    const updatedUsers = await group.getUsers();

                    const userDetails = updatedUsers.map((user) => ({
                        id: user.id,
                        first_name: user.first_name,
                        middle_name: user.middle_name,
                        last_name: user.last_name,
                    }));

                    return res.json({
                        group: {
                            id: group.id,
                            title: group.title,
                            users: userDetails,
                        },
                    });
                }

                return res.json({
                    group: {
                        id: group.id,
                        title: group.title,
                        users: [],
                    },
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
        const { group_id } = req.body;

        try {
            const group_with_users = await Users_Groups.findAll({
                where: {
                    group_id: group_id,
                },
            });

            if (group_with_users) {
                await Users_Groups.destroy({
                    where: {
                        group_id: group_id,
                    },
                });
            }
            await Groups.destroy({
                where: {
                    id: group_id,
                },
            });

            return res.json({
                message: `Группа по id ${group_id} была удалена`,
            });
        } catch (e) {
            return ApiError.badRequest("Невозможно удалить группу");
        }
    }
}

module.exports = new GroupController();
