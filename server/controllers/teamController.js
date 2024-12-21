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
            const { name, description, creator_id, group_ids, user_ids } =
                req.body;

            if (!name || !creator_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать название команды и создателя"
                    )
                );
            }

            // Проверка существования пользователя-создателя
            const creator = await Users.findByPk(creator_id);
            if (!creator) {
                return next(
                    ApiError.badRequest("Создатель с указанным ID не найден")
                );
            }

            // Создаем команду
            const team = await Teams.create({
                name,
                description,
                creator_id,
            });

            // Если есть указанные пользователи, добавляем их в команду
            if (user_ids && user_ids.length) {
                const teamUsersData = user_ids.map((userId) => ({
                    team_id: team.id,
                    user_id: userId,
                }));
                await Users_Teams.bulkCreate(teamUsersData);
            }

            // Если есть указанные группы, добавляем их в таблицу Groups_Teams
            if (group_ids && group_ids.length) {
                const groupTeamsData = group_ids.map((groupId) => ({
                    group_id: groupId,
                    team_id: team.id,
                }));
                await Groups_Teams.bulkCreate(groupTeamsData);

                // Добавляем всех пользователей из указанных групп в команду
                const groupUsers = await Users_Groups.findAll({
                    where: { group_id: group_ids },
                });

                if (groupUsers.length) {
                    const teamGroupUsersData = groupUsers.map((groupUser) => ({
                        team_id: team.id,
                        user_id: groupUser.user_id,
                    }));
                    await Users_Teams.bulkCreate(teamGroupUsersData);
                }
            }

            return res.json(team);
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
                        model: Groups,
                        through: { model: Groups_Teams, attributes: [] },
                        attributes: ["id", "title"],
                        include: [
                            {
                                model: Users,
                                through: { attributes: [] },
                                attributes: [
                                    "id",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                ],
                            },
                        ],
                    },
                ],
            });

            if (!team) {
                return next(
                    ApiError.notFound("Команда с указанным ID не найдена")
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
                        model: Groups,
                        through: { model: Groups_Teams, attributes: [] },
                        attributes: ["id", "title"],
                        include: [
                            {
                                model: Users,
                                through: { attributes: [] },
                                attributes: [
                                    "id",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                ],
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
            const { id } = req.body;
            const team = await Teams.findByPk(id);
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
                        through: { attributes: [] },
                    },
                    {
                        model: Groups,
                        through: { model: Groups_Teams, attributes: [] },
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

            // Добавление новых пользователей, не привязанных к группам
            if (newUsers && newUsers.length > 0) {
                const usersToAdd = await Users.findAll({
                    where: { id: newUsers },
                });

                // Получаем всех пользователей, которые уже добавлены в группу
                const existingUsersInGroups = await Users_Groups.findAll({
                    where: { group_id: newGroups },
                    attributes: ["user_id"],
                });

                // Фильтруем пользователей, чтобы исключить тех, кто уже привязан к группе
                const existingUserIds = existingUsersInGroups.map(
                    (user) => user.user_id
                );
                const usersNotInGroups = usersToAdd.filter(
                    (user) => !existingUserIds.includes(user.id)
                );

                if (usersNotInGroups.length > 0) {
                    await team.addUsers(usersNotInGroups);
                }
            }

            // Добавление новых групп
            if (newGroups && newGroups.length > 0) {
                const groupsToAdd = await Groups.findAll({
                    where: { id: newGroups },
                });

                await team.addGroups(groupsToAdd);

                // Добавляем всех пользователей из указанных групп в команду, если они еще не добавлены
                const groupUsers = await Users_Groups.findAll({
                    where: { group_id: newGroups },
                });

                const usersInGroups = groupUsers.map(
                    (groupUser) => groupUser.user_id
                );
                const usersAlreadyInGroup = await Users.findAll({
                    where: { id: usersInGroups },
                });

                // Собираем пользователей, которые еще не добавлены
                const usersNotInGroups = usersToAdd.filter(
                    (user) => !usersAlreadyInGroup.some((u) => u.id === user.id)
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
                        through: { attributes: [] },
                    },
                    {
                        model: Groups,
                        through: { model: Groups_Teams, attributes: [] },
                        include: [
                            {
                                model: Users,
                                through: { attributes: [] },
                                attributes: [
                                    "id",
                                    "first_name",
                                    "middle_name",
                                    "last_name",
                                ],
                            },
                        ],
                    },
                ],
            });

            // Разделение пользователей на тех, кто в группах и тех, кто не в группах
            const allUsersInGroups = updatedTeam.groups.reduce((acc, group) => {
                group.users.forEach((user) => acc.add(user.id));
                return acc;
            }, new Set());

            // Пользователи команды, которых нет в группах
            const usersNotInGroups = updatedTeam.users.filter(
                (user) => !allUsersInGroups.has(user.id)
            );

            // Обновление результата
            return res.json({
                message: "Команда успешно обновлена",
                team: {
                    ...updatedTeam.toJSON(),
                    users: usersNotInGroups, // Показать только тех пользователей, которые не привязаны к группам
                    groups: updatedTeam.groups, // Группы с привязанными пользователями
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
