require("dotenv").config();
const { Assignments, Assignments_investments, Users_Teams, Teams, Assignments_Teams } = require("../models/models");
const ApiError = require("../error/ApiError");

class AssignmentController {
    async create(req, res, next) {
        try {
            const { title, description, due_date, comment, creator_id, team_id, investments = [] } = req.body;

            if (!title || !due_date || !creator_id || !team_id) {
                return next(ApiError.badRequest("Необходимо указать обязательные данные"));
            }

            // Проверка, состоит ли пользователь в команде
            const userInTeam = await Users_Teams.findOne({
                where: { user_id: creator_id, team_id },
            });

            if (!userInTeam) {
                return next(ApiError.forbidden("Пользователь не состоит в указанной команде"));
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
                team_id,
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
            next(ApiError.internal(`Ошибка при создании задания: ${error.message}`));
        }
    }

    // Получение всех заданий пользователя
    async getAll(req, res, next) {
        try {
            const { user_id } = req.query;

            if (!user_id) {
                return next(ApiError.badRequest("Необходимо указать ID пользователя"));
            }

            const userTeams = await Users_Teams.findAll({
                where: { user_id },
                attributes: ["team_id"],
            });

            const teamIds = userTeams.map((team) => team.team_id);

            if (teamIds.length === 0) {
                return res.json({ message: "Пользователь не состоит ни в одной команде", assignments: [] });
            }

            const assignments = await Assignments.findAll({
                include: [
                    {
                        model: Teams,
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
            next(ApiError.internal(`Ошибка при получении заданий: ${error.message}`));
        }
    }

    // Получение задания по ID и команде
    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const { team_id } = req.query;

            if (!id || !team_id) {
                return next(ApiError.badRequest("Необходимо указать ID задания и ID команды"));
            }

            const assignment = await Assignments.findOne({
                where: { id },
                include: [
                    {
                        model: Teams,
                        through: { attributes: [] },
                        where: { id: team_id },
                    },
                    {
                        model: Assignments_investments,
                        attributes: ["id", "file_url"],
                    },
                ],
            });

            if (!assignment) {
                return next(ApiError.notFound("Задание не найдено или не привязано к указанной команде"));
            }

            return res.json(assignment);
        } catch (error) {
            next(ApiError.internal(`Ошибка при получении задания: ${error.message}`));
        }
    }

    // Обновление задания
    async update(req, res, next) {
        try {
            const { id, title, description, due_date, comment, investments = [] } = req.body;

            if (!id) {
                return next(ApiError.badRequest("Необходимо указать ID задания"));
            }

            const assignment = await Assignments.findByPk(id);

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
                await Assignments_investments.destroy({ where: { assignment_id: id } });
                const investmentRecords = investments.map((fileUrl) => ({
                    assignment_id: id,
                    file_url: fileUrl,
                }));
                await Assignments_investments.bulkCreate(investmentRecords);
            }

            return res.json({
                message: "Задание успешно обновлено",
                assignment,
            });
        } catch (error) {
            next(ApiError.internal(`Ошибка при обновлении задания: ${error.message}`));
        }
    }

    // Удаление задания
    async delete(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(ApiError.badRequest("Необходимо указать ID задания"));
            }

            const assignment = await Assignments.findByPk(id);

            if (!assignment) {
                return next(ApiError.notFound("Задание не найдено"));
            }

            // Удаление связей в Assignments_Teams
            await Assignments_Teams.destroy({ where: { assignment_id: id } });

            // Удаление задания и связанных вложений
            await Assignments_investments.destroy({ where: { assignment_id: id } });
            await assignment.destroy();

            return res.json({ message: "Задание успешно удалено" });
        } catch (error) {
            next(ApiError.internal(`Ошибка при удалении задания: ${error.message}`));
        }
    }
}

module.exports = new AssignmentController();
