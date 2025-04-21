import dotenv from "dotenv";
dotenv.config();

import {
    Assignments,
    Files,
    Users_Teams,
    Teams,
    Teams_Tasks,
    Users,
    Tasks,
} from "../models/models.js";

import ApiError from "../error/ApiError.js";

class AssignmentController {
    // Создание назаначения
    async create(req, res, next) {
        try {
            const {
                title,
                description,
                comment,
                creator_id,
                user_id,
                task_id,
                investments = [],
                status,
                plan_date,
            } = req.body;

            if (!title || !plan_date || !creator_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать обязательные данные"
                    )
                );
            }

            const task = await Tasks.findByPk(task_id);

            if (!task) {
                return next(ApiError.badRequest("Задания не существует"));
            }

            // Создание назначения
            const assignment = await Assignments.create({
                title,
                description,
                plan_date,
                comment,
                creator_id,
                user_id,
                task_id,
                status: status || "assigned",
            });

            let assignmentInvestments = [];

            // Добавление вложений
            if (investments.length > 0) {
                const investmentRecords = investments.map((fileUrl) => ({
                    entity_id: assignment.id,
                    entity_type: "assignment",
                    file_url: fileUrl,
                }));
                assignmentInvestments = await Files.bulkCreate(
                    investmentRecords
                );
            }

            return res.json({
                message: "Назначение успешно создано",
                assignment: {
                    assignment,
                    investments: assignmentInvestments,
                },
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при создании назначения: ${error.message}`
                )
            );
        }
    }

    // Получение всех назначений пользователя
    async getAll(req, res, next) {
        try {
            const { user_id, filter } = req.body;

            if (!user_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID пользователя")
                );
            }

            // Проверяем команды пользователя
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
            const { count, rows: assignments } =
                await Assignments.findAndCountAll({
                    where: {
                        user_id: user_id,
                    },
                });

            // Фильтрация заданий
            // const filteredAssignments = assignments.filter((assignment) => {
            //     const now = new Date();
            //     const dueDate = new Date(assignment.due_date);
            //     const hasSubmission =
            //         assignment.submission !== null &&
            //         assignment.submission !== undefined;

            //     switch (filter) {
            //         case "current":
            //             return !hasSubmission && dueDate >= now;
            //         case "completed":
            //             return hasSubmission;
            //         case "overdue":
            //             return !hasSubmission && dueDate < now;
            //         default:
            //             return true;
            //     }
            // });

            return res.json({ assignments: assignments, total: count });
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

            if (!id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID назначения")
                );
            }

            // Проверяем, в каких командах состоит пользователь
            // const userTeams = await Users_Teams.findAll({
            //     where: { user_id: user_id },
            //     attributes: ["team_id"],
            // });

            // const teamIds = userTeams.map((team) => team.team_id);

            // if (teamIds.length === 0) {
            //     return next(
            //         ApiError.forbidden(
            //             "Пользователь не состоит в командах, связанных с этим заданием"
            //         )
            //     );
            // }

            const assignment = await Assignments.findOne({
                where: { id },
                include: [
                    {
                        model: Files,
                        attributes: [
                            "id",
                            "entity_id",
                            "entity_type",
                            "file_url",
                        ],
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

            return res.json({ assignment });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении задания: ${error.message}`
                )
            );
        }
    }

    // Обновление назначения
    async update(req, res, next) {
        try {
            const {
                assignment_id,
                title,
                description,
                plan_date,
                comment,
                investments = [],
            } = req.body;

            if (!assignment_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID назначения")
                );
            }

            const assignment = await Assignments.findByPk(assignment_id);

            if (!assignment) {
                return next(ApiError.notFound("Назначение не найдено"));
            }

            // Обновление назначения
            await assignment.update({
                title: title || assignment.title,
                description: description || assignment.description,
                comment: comment || assignment.comment,
                plan_date: plan_date || assignment.plan_date,
            });

            let assignmentInvestments = [];

            // Обновление вложений (удаляем старые и добавляем новые)
            if (investments.length > 0) {
                await Files.update({
                    where: { assignment_id: assignment_id },
                });
                const investmentRecords = investments.map((fileUrl) => ({
                    assignment_id: assignment_id,
                    file_url: fileUrl,
                }));
                assignmentInvestments = await Files.bulkCreate(
                    investmentRecords
                );
            }

            return res.json({
                message: "Назначение успешно обновлено",
                assignment: {
                    assignment,
                    investments: assignmentInvestments,
                },
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при обновлении назначения: ${error.message}`
                )
            );
        }
    }

    // Удаление назначения
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
            await Teams_Tasks.destroy({
                where: { assignment_id: task_id },
            });

            // Удаление задания и связанных вложений
            await Files.destroy({
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

export default new AssignmentController();
