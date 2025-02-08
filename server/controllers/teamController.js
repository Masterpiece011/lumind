require("dotenv").config();
const {
    Users,
    Groups,
    Users_Groups,
    Teams,
    Users_Teams,
    Groups_Teams,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class TeamController {
    // Создание команды с учетом таблицы Groups_Teams

    async create(req, res, next) {
        try {
            const {
                name,
                description,
                creator_id,
                group_ids = [],
                user_ids = [],
            } = req.body;

            // Проверка обязательных полей

            if (!name || !creator_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать название команды и создателя"
                    )
                );
            }

            // Преобразование group_ids и user_ids в массив, если они переданы как одиночное значение

            if (!Array.isArray(group_ids)) {
                group_ids = [group_ids];
            }
            if (!Array.isArray(user_ids)) {
                user_ids = [user_ids];
            }

            // Проверка существования пользователя-создателя

            const creator = await Users.findByPk(creator_id);
            if (!creator) {
                return next(
                    ApiError.badRequest("Создатель с указанным ID не найден")
                );
            }

            // Создание команды

            const team = await Teams.create({
                name: name,
                description: description,
                creator_id: creator_id,
            });

            // Добавление пользователей в команду

            if (user_ids.length > 0) {
                const uniqueUserIds = [...new Set(user_ids)];
                const userRecords = uniqueUserIds.map((userId) => ({
                    team_id: team.id,
                    user_id: userId,
                }));
                await Users_Teams.bulkCreate(userRecords);
            }

            // Добавление групп в команду

            if (group_ids.length > 0) {
                const uniqueGroupIds = [...new Set(group_ids)];
                const groupRecords = uniqueGroupIds.map((groupId) => ({
                    group_id: groupId,
                    team_id: team.id,
                }));
                await Groups_Teams.bulkCreate(groupRecords);

                // Извлечение пользователей из групп и добавление их в команду

                const groupUsers = await Users_Groups.findAll({
                    where: { group_id: uniqueGroupIds },
                });

                if (groupUsers.length > 0) {
                    const groupUserRecords = groupUsers.map((groupUser) => ({
                        team_id: team.id,
                        user_id: groupUser.user_id,
                    }));

                    // Исключение пользователей, которые уже есть в команде

                    const existingUserIds = new Set(user_ids);
                    const filteredGroupUserRecords = groupUserRecords.filter(
                        (record) => !existingUserIds.has(record.user_id)
                    );

                    // Добавляем пользователей из групп, если они не дублируются

                    if (filteredGroupUserRecords.length > 0) {
                        await Users_Teams.bulkCreate(filteredGroupUserRecords);
                    }
                }
            }

            return res.json({
                message: "Команда успешно создана",
                team: team,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    "Ошибка при создании команды: " + error.message
                )
            );
        }
    }
    // Получение одной команды с пользователями и группами

    async getOne(req, res, next) {
        try {
            const { id } = req.params;

            const team = await Teams.findByPk(id, {
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "img",
                            "email",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "role_id",
                        ],
                        through: { attributes: [] },
                    },
                    {
                        model: Groups,
                        through: { model: Groups_Teams, attributes: [] },
                        attributes: ["id", "title"],
                        include: [
                            {
                                model: Users,
                                attributes: [
                                    "id",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                    "email",
                                ],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });

            if (!team) {
                return next(
                    ApiError.notFound(
                        `Команда с указанным ID: ${id} не найдена`
                    )
                );
            }

            return res.json(team);
        } catch (error) {
            next(
                ApiError.internal(
                    "Ошибка при получении команды: " + error.message
                )
            );
        }
    }

    // Получение всех команд с пользователями и группами

    async getAll(req, res, next) {
        try {
            const teams = await Teams.findAll({
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "img",
                            "email",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "role_id",
                        ],
                        through: { attributes: [] },
                    },
                    {
                        model: Groups,
                        attributes: ["id", "title"],
                        through: { model: Groups_Teams, attributes: [] },
                        include: [
                            {
                                model: Users,
                                attributes: [
                                    "id",
                                    "img",
                                    "email",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                    "role_id",
                                ],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });

            return res.json(teams);
        } catch (error) {
            next(
                ApiError.internal(
                    "Ошибка при получении всех команд: " + error.message
                )
            );
        }
    }

    // Удаление команды

    async delete(req, res, next) {
        try {
            const { team_id } = req.body;
            const team = await Teams.findByPk(team_id);
            if (!team) {
                return next(
                    ApiError.notFound("Команда с указанным ID не найдена")
                );
            }
            await team.destroy();
            return res.json({ message: "Команда успешно удалена" });
        } catch (error) {
            next(
                ApiError.internal("Ошибка удаления команды: " + error.message)
            );
        }
    }

    // Обновление данных команды

    async update(req, res, next) {
        try {
            const { id, name, description, newUsers, newGroups } = req.body;

            // Найти команду по ID

            const team = await Teams.findByPk(id, {
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "img",
                            "email",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "role_id",
                        ],
                        through: { attributes: [] },
                    },
                    {
                        model: Groups,
                        attributes: ["id", "title"],
                        through: { model: Groups_Teams, attributes: [] },
                        include: [
                            {
                                model: Users,
                                attributes: [
                                    "id",
                                    "img",
                                    "email",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                    "role_id",
                                ],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });

            if (!team) {
                return next(
                    ApiError.badRequest("Команда с указанным ID не найдена")
                );
            }

            // Обновление данных команды

            if (name) team.name = name;
            if (description) team.description = description;
            await team.save();

            // Приведение newUsers к массиву, если это одно значение

            const userIds = Array.isArray(newUsers)
                ? newUsers
                : newUsers
                ? [newUsers]
                : [];
            const groupIds = Array.isArray(newGroups)
                ? newGroups
                : newGroups
                ? [newGroups]
                : [];

            // Добавление новых пользователей

            if (userIds.length > 0) {
                const usersToAdd = await Users.findAll({
                    where: { id: userIds },
                });

                const existingUsersInGroups = await Users_Groups.findAll({
                    where: { group_id: groupIds },
                    attributes: ["user_id"],
                });

                const existingUserIds = existingUsersInGroups.map(
                    (user) => user.user_id
                );

                const usersNotInGroups = usersToAdd.filter(
                    (user) =>
                        !existingUserIds.includes(user.id) &&
                        !team.users.some((u) => u.id === user.id)
                );

                if (usersNotInGroups.length > 0) {
                    await team.addUsers(usersNotInGroups);
                }
            }

            // Добавление новых групп

            if (groupIds.length > 0) {
                const groupsToAdd = await Groups.findAll({
                    where: { id: groupIds },
                });

                await team.addGroups(groupsToAdd);

                const groupUsers = await Users_Groups.findAll({
                    where: { group_id: groupIds },
                });

                const usersInGroups = groupUsers.map(
                    (groupUser) => groupUser.user_id
                );

                const usersAlreadyInGroup = await Users.findAll({
                    where: { id: usersInGroups },
                });

                const usersNotInGroups = usersAlreadyInGroup.filter(
                    (user) => !team.users.some((u) => u.id === user.id)
                );

                if (usersNotInGroups.length > 0) {
                    await team.addUsers(usersNotInGroups);
                }
            }

            // Обновление данных команды и связанных моделей

            const updatedTeam = await Teams.findByPk(id, {
                include: [
                    {
                        model: Users,
                        attributes: [
                            "id",
                            "img",
                            "email",
                            "first_name",
                            "middle_name",
                            "last_name",
                            "role_id",
                        ],
                        through: { attributes: [] },
                    },
                    {
                        model: Groups,
                        attributes: ["id", "title"],
                        through: { model: Groups_Teams, attributes: [] },
                        include: [
                            {
                                model: Users,
                                attributes: [
                                    "id",
                                    "img",
                                    "email",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                    "role_id",
                                ],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });

            const allUsersInGroups = updatedTeam.groups.reduce((acc, group) => {
                group.users.forEach((user) => acc.add(user.id));
                return acc;
            }, new Set());

            const usersNotInGroups = updatedTeam.users.filter(
                (user) => !allUsersInGroups.has(user.id)
            );

            return res.json({
                message: "Команда успешно обновлена",
                team: {
                    ...updatedTeam.toJSON(),
                    users: usersNotInGroups,
                    groups: updatedTeam.groups,
                },
            });
        } catch (error) {
            next(
                ApiError.internal("Ошибка обновления команды: " + error.message)
            );
        }
    }
}

module.exports = new TeamController();
