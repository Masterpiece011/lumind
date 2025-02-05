require("dotenv").config();
const {
    Assignments,
    Assignments_investments,
    Users_Teams,
    Teams,
    Assignments_Teams,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class AssignmentController {
    async create(req, res, next) {
        try {
            const {
                title,
                description,
                due_date,
                comment,
                creator_id,
                team_id,
                investments = [],
            } = req.body;

            if (!title || !due_date || !creator_id || !team_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать обязательные данные"
                    )
                );
            }

            // Проверка, состоит ли пользователь в команде
            const userInTeam = await Users_Teams.findOne({
                where: { user_id: creator_id, team_id: team_id },
            });

            if (!userInTeam) {
                return next(
                    ApiError.forbidden(
                        "Пользователь не состоит в указанной команде"
                    )
                );
            }

            // Создание задания
            const assignment = await Assignments.create({
                title,
                description,
                due_date,
                comment,
                creator_id,
            });

            // Привязка задания к команде через Assignments_Teams
            await Assignments_Teams.create({
                assignment_id: assignment.id,
                team_id: team_id,
                team_id: team_id,
            });

            // Добавление вложений
            if (investments.length > 0) {
                const investmentRecords = investments.map((fileUrl) => ({
                    assignment_id: assignment.id,
                    file_url: fileUrl,
                }));
                await Assignments_investments.bulkCreate(investmentRecords);
            }

            return res.json({
                message: "Задание успешно создано",
                assignment,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при создании задания: ${error.message}`
                )
            );
        }
    }

    // Получение всех заданий пользователя
    async getAll(req, res, next) {
        try {
            const { user_id } = req.body;

            if (!user_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID пользователя")
                );
            }

            // Получаем команды, в которых состоит пользователь
            const userTeams = await Users_Teams.findAll({
                where: { user_id: user_id },
                attributes: ["team_id"],
            });

            const teamIds = userTeams.map((team) => team.team_id);

            if (teamIds.length === 0) {
                return res.json({
                    message: "Пользователь не состоит ни в одной команде",
                    assignments: [],
                });
            }

            // Получаем задания, связанные с командами пользователя
            const assignments = await Assignments.findAll({
                include: [
                    {
                        model: Teams,
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                        where: { id: teamIds },
                    },
                    {
                        model: Assignments_investments,
                        attributes: ["id", "file_url"],
                    },
                ],
            });

            return res.json(assignments);
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении заданий: ${error.message}`
                )
            );
        }
    }

    // Получение задания по ID и команде
    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const { user_id } = req.query;

            if (!task_id || !user_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать ID задания и ID пользователя"
                    )
                );
            }

            // Проверяем, в каких командах состоит пользователь
            const userTeams = await Users_Teams.findAll({
                where: { user_id: user_id },
                attributes: ["team_id"],
            });

            const teamIds = userTeams.map((team) => team.team_id);

            if (teamIds.length === 0) {
                return next(
                    ApiError.forbidden(
                        "Пользователь не состоит в командах, связанных с этим заданием"
                    )
                );
            }

            const assignment = await Assignments.findOne({
                where: { id: task_id },
                include: [
                    {
                        model: Teams,
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                        where: { id: teamIds },
                    },
                    {
                        model: Assignments_investments,
                        attributes: ["id", "file_url"],
                    },
                ],
            });

            if (!assignment) {
                return next(
                    ApiError.badRequest(
                        "Задание не найдено или не привязано к командам пользователя"
                    )
                );
            }

            return res.json(assignment);
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении задания: ${error.message}`
                )
            );
        }
    }

    // Обновление задания
    async update(req, res, next) {
        try {
            const {
                task_id,
                title,
                description,
                due_date,
                comment,
                investments = [],
            } = req.body;

            if (!task_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID задания")
                );
            }

            const assignment = await Assignments.findByPk(task_id);

            if (!assignment) {
                return next(ApiError.notFound("Задание не найдено"));
            }

            // Обновление задания
            await assignment.update({
                title: title || assignment.title,
                description: description || assignment.description,
                due_date: due_date || assignment.due_date,
                comment: comment || assignment.comment,
            });

            // Обновление вложений (удаляем старые и добавляем новые)
            if (investments.length > 0) {
                await Assignments_investments.update({
                    where: { assignment_id: task_id },
                });
                const investmentRecords = investments.map((fileUrl) => ({
                    assignment_id: task_id,
                    file_url: fileUrl,
                }));
                await Assignments_investments.bulkCreate(investmentRecords);
            }

            return res.json({
                message: "Задание успешно обновлено",
                assignment,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при обновлении задания: ${error.message}`
                )
            );
        }
    }

    // Удаление задания
    async delete(req, res, next) {
        try {
            const { task_id } = req.body;

            if (!task_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID задания")
                );
            }

            const assignment = await Assignments.findByPk(task_id);

            if (!assignment) {
                return next(ApiError.notFound("Задание не найдено"));
            }

            // Удаление связей в Assignments_Teams
            await Assignments_Teams.destroy({
                where: { assignment_id: task_id },
            });

            // Удаление задания и связанных вложений
            await Assignments_investments.destroy({
                where: { assignment_id: task_id },
            });
            await assignment.destroy();

            return res.json({ message: "Задание успешно удалено" });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при удалении задания: ${error.message}`
                )
            );
        }
    }
}

module.exports = new AssignmentController();
