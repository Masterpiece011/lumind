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
import { where } from "sequelize";

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
            const { user_id, status } = req.body;

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

            const whereCondition = { user_id };
            if (status && status !== "all") {
                whereCondition.status = status;
            }

            // Получаем назначения пользователя
            const { count, rows: assignments } =
                await Assignments.findAndCountAll({
                    where: whereCondition,
                });

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
                return next(ApiError.badRequest("Назначение не найдено"));
            }

            const assignmentInvestments = await Files.findAll({
                where: { entity_id: assignment.id, entity_type: "assignment" },
            });

            const task = await Tasks.findByPk(assignment.task_id);

            const taskInvestments = await Files.findAll({
                where: { entity_id: assignment.task_id, entity_type: "task" },
            });

            const creator = await Users.findByPk(assignment.creator_id, {
                attributes: {
                    exclude: ["password", "created_at", "updated_at"],
                },
            });

            const response = {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                comment: assignment.comment,
                creator: creator || undefined,
                task: task || undefined,
                task_files: taskInvestments || [],
                status: assignment.status,
                user_id: assignment.user_id,
                plan_date: assignment.plan_date,
                created_at: assignment.created_at,
                assignment_files: assignmentInvestments || [],
            };

            return res.json({ assignment: response });
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
                assessment,
                status,
                user_id,
            } = req.body;

            if (!assignment_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID назначения")
                );
            }

            const assignment = await Assignments.findByPk(assignment_id, {
                include: [
                    { model: Tasks, as: "task" },
                    {
                        model: Files,
                        as: "files",
                        where: { entity_type: "assignment" },
                        required: false,
                    },
                ],
            });

            if (!assignment) {
                return next(ApiError.notFound("Назначение не найдено"));
            }

            await assignment.update({
                title: title || assignment.title,
                description: description || assignment.description,
                comment: comment || assignment.comment,
                assessment: assessment || assignment.assessment,
                status: status || assignment.status,
                plan_date: plan_date || assignment.plan_date,
                user_id: user_id || assignment.user_id,
            });

            if (investments.length > 0 || status) {
                await Files.destroy({
                    where: {
                        entity_id: assignment_id,
                        entity_type: "assignment",
                    },
                });

                if (investments.length > 0) {
                    const investmentRecords = investments.map((fileUrl) => ({
                        entity_id: assignment_id,
                        entity_type: "assignment",
                        file_url: fileUrl,
                    }));
                    await Files.bulkCreate(investmentRecords);
                }
            }

            const updatedAssignment = await Assignments.findByPk(
                assignment_id,
                {
                    include: [
                        { model: Tasks, as: "task" },
                        {
                            model: Files,
                            as: "files",
                            where: { entity_type: "assignment" },
                            required: false,
                        },
                    ],
                }
            );

            return res.json({
                message: "Назначение успешно обновлено",
                assignment: {
                    ...updatedAssignment.get({ plain: true }),
                    assignment_files: updatedAssignment.files || [],
                    task_files: updatedAssignment.task?.files || [],
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
