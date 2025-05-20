import dotenv from "dotenv";
dotenv.config();
import { Op } from "sequelize";

import {
    Assignments,
    Files,
    Users_Teams,
    Teams,
    Teams_Tasks,
    Users,
    Tasks,
    Groups,
} from "../models/models.js";

import ApiError from "../error/ApiError.js";
import { where } from "sequelize";

class AssignmentController {
    // Создание назаначения
    async create(req, res, next) {
        try {
            const { creator_id, user_id, task_id, status, plan_date } =
                req.body;

            // Проверка обязательных полей
            if (!creator_id || !user_id || !task_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать:  creator_id, user_id и task_id"
                    )
                );
            }

            // Проверка существования задания
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
                plan_date: plan_date || null,
                creator_id,
                user_id,
                task_id,
                status: status || "assigned",
            });

            return res.status(201).json({
                message: "Назначение успешно создано",
                assignment: {
                    ...assignment.get({ plain: true }),
                    task_files: task.files || [], // Файлы из задания
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
            const { user_id, status, team_id } = req.body;
            const currentUserId = req.user.id;
            const userRole = req.user.role;

            if (!user_id && !team_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать ID пользователя или команды"
                    )
                );
            }

            // Для преподавателей - получаем все задания, которые они создали
            if (userRole === "INSTRUCTOR") {
                const whereCondition = { creator_id: user_id };
                if (status && status !== "all") {
                    whereCondition.status = status;
                }

                const { count, rows: assignments } =
                    await Assignments.findAndCountAll({
                        where: whereCondition,
                        include: [{ model: Tasks, as: "task" }],
                    });

                return res.json({ assignments, total: count });
            }

            // Для обычных пользователей
            const whereCondition = {};

            // Если запрашивают задания команды
            if (team_id) {
                // Проверяем, состоит ли пользователь в этой команде
                const isMember = await Users_Teams.findOne({
                    where: { user_id: currentUserId, team_id },
                });

                if (!isMember) {
                    return next(
                        ApiError.forbidden(
                            "Пользователь не состоит в этой команде"
                        )
                    );
                }

                // Получаем задания, связанные с этой командой
                const teamTasks = await Teams_Tasks.findAll({
                    where: { team_id },
                    attributes: ["task_id"],
                });

                const taskIds = teamTasks.map((t) => t.task_id);

                // Добавляем условие для заданий команды
                whereCondition.task_id = { [Op.in]: taskIds };
            }

            if (status && status !== "all") {
                whereCondition.status = status;
            }

            // Получаем назначения
            const { count, rows: assignments } =
                await Assignments.findAndCountAll({
                    where: whereCondition,
                    include: [{ model: Tasks, as: "task" }],
                    distinct: true,
                });

            return res.json({ assignments, total: count });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении заданий: ${error.message}`
                )
            );
        }
    }

    // Получение собственных назначений, ОБЩИЙ ВАРИАНТ В  ASSIGNMENTS-АХ

    async getAllSelfAssignments(req, res, next) {
        try {
            const { user_id } = req.body;

            if (!user_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID пользователя")
                );
            }

            const { count, rows: assignments } =
                await Assignments.findAndCountAll({
                    where: { user_id: user_id },
                    attributes: {
                        exclude: [
                            "task_id",
                            "comment",
                            "created_at",
                            "updated_at",
                            "creator_id",
                        ],
                    },
                    include: [
                        {
                            model: Tasks,
                            as: "task",
                            include: [
                                // Включаем команды, связанные с задачей
                                {
                                    model: Teams,
                                    as: "teams", // Убедитесь, что это правильное название ассоциации
                                    through: { attributes: [] }, // Исключаем промежуточную таблицу
                                    attributes: {
                                        exclude: [
                                            "created_at",
                                            "updated_at",
                                            "creator_id",
                                        ],
                                    },
                                    required: false, // Если связь не обязательная
                                },
                            ],
                            attributes: {
                                exclude: [
                                    "created_at",
                                    "updated_at",
                                    "creator_id",
                                ],
                            },
                        },
                    ],
                });

            if (!count === 0) {
                return ApiError.badRequest("Юзер лох у него нет ничего!");
            }

            const response = assignments.map((assignment) => {
                const team =
                    assignment.task.teams?.[0]?.get({ plain: true }) || null;

                const taskData = assignment.task.get({ plain: true });

                // Удаляем teams из task, если не хотим дублирования
                if (taskData.teams) {
                    delete taskData.teams;
                }

                return {
                    id: assignment.id,
                    status: assignment.status,
                    plan_date: assignment.plan_date,
                    user_id: assignment.user_id,
                    task: { ...taskData }, // Разворачиваем поля задачи
                    team: team, // Добавляем команду отдельно
                };
            });

            return res.json({
                assignments: response, // Массив заданий в одном уровне
                total: count,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении заданий: ${error.message}`
                )
            );
        }
    }

    // Получение собственных назначений, В РАМКАХ ОДНОЙ КОМАНДЫ

    async getAllSelfTeamAssignments(req, res, next) {
        try {
            const { user_id, team_id } = req.body;

            if (!user_id || !team_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать ID пользователя и ID команды"
                    )
                );
            }

            // 1. Получаем все task_id для данной команды
            const teamTasks = await Teams_Tasks.findAll({
                where: { team_id },
                attributes: ["task_id"],
                raw: true,
            });

            if (!teamTasks.length) {
                return res.json({ assignments: [], total: 0 });
            }

            const taskIds = teamTasks.map((t) => t.task_id);

            // 2. Ищем assignments пользователя с этими task_id
            const { count, rows: assignments } =
                await Assignments.findAndCountAll({
                    where: {
                        user_id,
                        task_id: taskIds, // Фильтр по task_id из teams_tasks
                    },
                    attributes: {
                        exclude: [
                            "comment",
                            "created_at",
                            "updated_at",
                            "creator_id",
                        ],
                    },
                    include: [
                        {
                            model: Tasks,
                            as: "task",
                            attributes: {
                                exclude: [
                                    "created_at",
                                    "updated_at",
                                    "creator_id",
                                ],
                            },
                            include: [
                                {
                                    model: Teams,
                                    as: "teams",
                                    through: { attributes: [] },
                                    where: { id: team_id },
                                    attributes: [
                                        "id",
                                        "name",
                                        "description",
                                        "avatar_color",
                                    ],
                                    required: true,
                                },
                            ],
                        },
                    ],
                });

            if (count === 0) {
                return res.json({ assignments: [], total: 0 });
            }

            const response = assignments.map((assignment) => {
                const team =
                    assignment.task.teams?.[0]?.get({ plain: true }) || null;

                const taskData = assignment.task.get({ plain: true });

                // Удаляем teams из task, если не хотим дублирования
                if (taskData.teams) {
                    delete taskData.teams;
                }

                return {
                    id: assignment.id,
                    status: assignment.status,
                    plan_date: assignment.plan_date,
                    user_id: assignment.user_id,
                    task: { ...taskData }, // Разворачиваем поля задачи
                    team: team, // Добавляем команду отдельно
                };
            });

            return res.json({ assignments: response, total: count });
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
            const userId = req.user.id;
            const userRole = req.user.role;
            const assignment = await Assignments.findByPk(id, {
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
            });

            if (!assignment) {
                return next(ApiError.notFound("Назначение не найдено"));
            }

            // Проверка прав доступа
            if (
                userRole !== "INSTRUCTOR" &&
                assignment.user_id !== userId &&
                assignment.creator_id !== userId
            ) {
                return next(ApiError.forbidden("Нет доступа к этому заданию"));
            }

            // Получаем данные пользователей
            const [student, creator] = await Promise.all([
                Users.findByPk(assignment.user_id, {
                    attributes: ["id", "first_name", "last_name", "email"],
                }),
                Users.findByPk(assignment.creator_id, {
                    attributes: ["id", "first_name", "last_name", "email"],
                }),
            ]);

            // Формируем ответ
            const response = {
                ...assignment.get({ plain: true }),
                creator,
                task: {
                    ...(assignment.task?.get({ plain: true }) || {}),
                    files: assignment.task?.files || [],
                },
                files: assignment.files || [],
            };

            return res.json({ assignment: response });
        } catch (error) {
            console.error("Ошибка получения задания:", error);
            next(ApiError.internal(error.message));
        }
    }

    async getStudentAssignment(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // ID текущего пользователя

            // 1. Получаем назначение БЕЗ проверки creator_id в WHERE
            const assignment = await Assignments.findOne({
                where: { id },
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
                raw: false, // Важно: не преобразовывать в plain object
            });

            if (!assignment) {
                return next(ApiError.notFound("Назначение не найдено"));
            }

            // 2. Проверяем права доступа
            if (assignment.creator_id !== userId) {
                return next(ApiError.forbidden("Нет доступа к этому заданию"));
            }

            // 3. Получаем данные пользователей ОТДЕЛЬНЫМИ запросами
            const student = await Users.findByPk(assignment.user_id, {
                attributes: ["id", "first_name", "last_name", "email"],
                raw: true,
            });

            const creator = await Users.findByPk(assignment.creator_id, {
                attributes: ["id", "first_name", "last_name", "email"],
                raw: true,
            });

            // 4. Формируем ответ вручную
            const response = {
                id: assignment.id,
                comment: assignment.comment,
                user_id: assignment.user_id, // Должно быть из БД
                creator_id: assignment.creator_id, // Должно быть из БД
                assessment: assignment.assessment,
                status: assignment.status,
                plan_date: assignment.plan_date,
                created_at: assignment.created_at,
                updated_at: assignment.updated_at,
                task_id: assignment.task_id,
                task: assignment.task
                    ? {
                          ...assignment.task.get({ plain: true }),
                          files: assignment.task.files || [],
                      }
                    : null,
                files: assignment.files || [],
                user: student || null,
                creator: creator || null,
            };

            console.log("Отправляемые данные:", {
                user_id_from_db: assignment.user_id,
                creator_id_from_db: assignment.creator_id,
                response_user_id: response.user_id,
                response_creator_id: response.creator_id,
            });

            return res.json({ assignment: response });
        } catch (error) {
            console.error("Ошибка получения задания:", error);
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

            // Удаляем старые файлы задания, если статус меняется на "assigned"
            if (status === "assigned") {
                await Files.destroy({
                    where: {
                        entity_type: "assignment",
                        entity_id: assignment_id,
                    },
                });
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

    async getStudentsWithAssignments(req, res, next) {
        try {
            const userId = req.user.id;
            const { taskId } = req.query;

            // 1. Формируем условия запроса
            const where = { creator_id: userId };
            if (taskId) where.task_id = taskId;

            // 2. Получаем все назначения
            const assignments = await Assignments.findAll({
                where,
                include: [
                    {
                        model: Tasks,
                        attributes: ["id", "title", "description"],
                        include: [
                            {
                                model: Files,
                                where: { entity_type: "task" },
                                required: false,
                                attributes: ["id", "file_url", "original_name"],
                            },
                        ],
                    },
                    {
                        model: Files,
                        where: { entity_type: "assignment" },
                        required: false,
                        attributes: ["id", "file_url", "original_name"],
                    },
                ],
                order: [["created_at", "DESC"]],
            });

            // 3. Получаем ID всех студентов (исключая самого преподавателя)
            const studentIds = [
                ...new Set(assignments.map((a) => a.user_id)),
            ].filter((id) => id !== userId); // Исключаем преподавателя

            if (studentIds.length === 0) {
                return res.json({ students: [] });
            }

            // 4. Получаем информацию о студентах с группами и командами
            const students = await Users.findAll({
                where: { id: studentIds },
                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                    "middle_name",
                    "email",
                ],
                include: [
                    {
                        model: Groups,
                        as: "group",
                        attributes: ["id", "title"],
                    },
                    {
                        model: Teams,
                        as: "teams",
                        through: { attributes: [] },
                        attributes: ["id", "name"],
                    },
                ],
            });

            // 5. Создаем и заполняем маппинг студентов
            const studentsMap = new Map();
            students.forEach((student) => {
                studentsMap.set(student.id, {
                    ...student.get({ plain: true }),
                    assignments: [],
                });
            });

            assignments.forEach((assignment) => {
                if (studentsMap.has(assignment.user_id)) {
                    studentsMap.get(assignment.user_id).assignments.push({
                        id: assignment.id,
                        status: assignment.status,
                        assessment: assignment.assessment,
                        comment: assignment.comment,
                        plan_date: assignment.plan_date,
                        created_at: assignment.created_at,
                        task: {
                            id: assignment.task.id,
                            title: assignment.task.title,
                            description: assignment.task.description,
                            files: assignment.task.files || [],
                        },
                        files: assignment.files || [],
                    });
                }
            });

            return res.json({
                students: Array.from(studentsMap.values()),
                taskId: taskId || null,
            });
        } catch (error) {
            console.error("Error in getStudentsWithAssignments:", error);
            next(ApiError.internal("Ошибка при получении списка студентов"));
        }
    }
}

export default new AssignmentController();
