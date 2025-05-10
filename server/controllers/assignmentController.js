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
                team_id,
                investments = [],
                status,
                due_date,
            } = req.body;

            // Проверка обязательных полей
            if (!title || !due_date || !creator_id || !user_id || !task_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать: title, due_date, creator_id, user_id и task_id"
                    )
                );
            }

            // Проверка существования задачи и ее файлов
            const task = await Tasks.findByPk(task_id, {
                include: [
                    {
                        model: Files,
                        as: "files",
                        where: { entity_type: "task" },
                        required: false,
                    },
                ],
            });

            if (!task) {
                return next(ApiError.badRequest("Задания не существует"));
            }

            // Проверка пользователей
            const [creator, user] = await Promise.all([
                Users.findByPk(creator_id),
                Users.findByPk(user_id),
            ]);

            if (!creator || !user) {
                return next(ApiError.badRequest("Пользователь не найден"));
            }

            // Создание назначения
            const assignment = await Assignments.create({
                title,
                description,
                plan_date: due_date,
                comment,
                creator_id,
                user_id,
                task_id,
                team_id,
                status: status || "assigned",
            });

            // Добавление вложений ответа (если есть)
            let assignmentInvestments = [];
            if (investments.length > 0) {
                assignmentInvestments = await Files.bulkCreate(
                    investments.map((fileUrl) => ({
                        entity_id: assignment.id,
                        entity_type: "assignment",
                        file_url: fileUrl,
                    }))
                );
            }

            return res.status(201).json({
                message: "Назначение успешно создано",
                assignment: {
                    ...assignment.get({ plain: true }),
                    task_files: task.files || [], // Файлы из задания
                    assignment_files: assignmentInvestments, // Файлы ответа
                },
            });
        } catch (error) {
            console.error("Ошибка создания назначения:", error);
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

            const assignment = await Assignments.findOne({
                where: { id },
                include: [
                    {
                        model: Tasks,
                        as: "task",
                    },
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

            const taskFiles = await Files.findAll({
                where: {
                    entity_id: assignment.task_id,
                    entity_type: "task",
                },
            });

            const creator = await Users.findOne({
                where: { id: assignment.creator_id },
                attributes: { exclude: ["password"] },
            });

            const response = {
                ...assignment.get({ plain: true }),
                creator,
                task: {
                    ...assignment.task.get({ plain: true }),
                    files: taskFiles || [],
                },
                assignment_files: assignment.files || [],
            };

            return res.json({ assignment: response });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async update(req, res, next) {
        try {
            const {
                assignment_id,
                title,
                description,
                plan_date,
                comment,
                assessment,
                status,
                user_id,
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

            await assignment.update({
                title: title || assignment.title,
                description: description || assignment.description,
                comment: comment || assignment.comment,
                assessment: assessment || assignment.assessment,
                status: status || assignment.status,
                plan_date: plan_date || assignment.plan_date,
                user_id: user_id || assignment.user_id,
            });

            const updatedAssignment = await Assignments.findByPk(
                assignment_id,
                {
                    include: [
                        {
                            model: Tasks,
                            as: "task",
                            include: [
                                {
                                    model: Files,
                                    as: "files",
                                    where: { entity_type: "task" },
                                    required: false,
                                },
                            ],
                        },
                        {
                            model: Files,
                            as: "files",
                            where: { entity_type: "assignment" },
                            required: false,
                        },
                    ],
                }
            );

            const responseData = updatedAssignment.get({ plain: true });

            return res.json({
                message: "Назначение успешно обновлено",
                assignment: {
                    ...responseData,
                    task_files: responseData.task?.files || [],
                    assignment_files: responseData.files || [],
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
