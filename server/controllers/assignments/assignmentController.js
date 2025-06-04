import dotenv from "dotenv";
dotenv.config();

import { Op } from "sequelize";

import {
    Assignments,
    Files,
    Teams,
    Users,
    Tasks,
    Groups,
} from "../../models/models.js";

import createAssignment from "./methods/createAssignment.js";
import getAllAssignments from "./methods/getAllAssignments.js";
import getAllSelfAssignments from "./methods/getAllSelfAssignments.js";
import getAllSelfTeamAssignments from "./methods/getAllSelfTeamAssignments.js";
import getOneAssignment from "./methods/getOneAssignment.js";
import updateAssignment from "./methods/updateAssignment.js";
import deleteAssignment from "./methods/deleteAssignment.js";
import getStudentsWithAssignments from "./methods/getStudentsWithAssignments.js";
import getInstructorAssignments from "./methods/getInstructorAssignments.js";

import ApiError from "../../error/ApiError.js";

class AssignmentController {
    // Создание назаначения

    create = createAssignment;

    // Получение всех назначений пользователя

    getAll = getAllAssignments;

    // Получение собственных назначений, ОБЩИЙ ВАРИАНТ В  ASSIGNMENTS-АХ

    getAllSelfAssignments = getAllSelfAssignments;

    // Получение собственных назначений, В РАМКАХ ОДНОЙ КОМАНДЫ

    getAllSelfTeamAssignments = getAllSelfTeamAssignments;

    // Получение созданных назначений преподавателя
    
    getInstructorAssignments = getInstructorAssignments;

    // Получение задания по ID и команде

    getOne = getOneAssignment;

    async getStudentAssignment(req, res, next) {
        try {
            const { assignmentId, userId } = req.params;
            const currentUserId = req.user.id;
            const userRole = req.user.role;

            // 1. Get the assignment with task and files
            const assignment = await Assignments.findOne({
                where: { id: assignmentId, user_id: userId },
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

            // 2. Check permissions
            // Allow if current user is the creator, the assigned user, or an instructor
            if (
                userRole !== "INSTRUCTOR" &&
                assignment.creator_id !== currentUserId &&
                assignment.user_id !== currentUserId
            ) {
                return next(ApiError.forbidden("Нет доступа к этому заданию"));
            }

            // 3. Get user details (both student and creator)
            const [student, creator] = await Promise.all([
                Users.findByPk(assignment.user_id, {
                    attributes: [
                        "id",
                        "first_name",
                        "last_name",
                        "email",
                        "middle_name",
                    ],
                }),
                Users.findByPk(assignment.creator_id, {
                    attributes: ["id", "first_name", "last_name", "email"],
                }),
            ]);

            // 4. Get student's group and teams
            const studentWithGroups = await Users.findByPk(assignment.user_id, {
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
                        where: {
                            id: {
                                [Op.in]: sequelize.literal(`(
                                SELECT team_id FROM teams_tasks 
                                WHERE task_id = '${assignment.task_id}'
                            )`),
                            },
                        },
                        required: false,
                    },
                ],
            });

            // 5. Format the response
            const response = {
                student: {
                    ...studentWithGroups.get({ plain: true }),
                    assignments: [
                        {
                            id: assignment.id,
                            status: assignment.status,
                            assessment: assignment.assessment,
                            comment: assignment.comment,
                            plan_date: assignment.plan_date,
                            created_at: assignment.created_at,
                            updated_at: assignment.updated_at,
                            task: {
                                id: assignment.task.id,
                                title: assignment.task.title,
                                description: assignment.task.description,
                                comment: assignment.task.comment,
                                files: assignment.task.files || [],
                            },
                            files: assignment.files || [],
                        },
                    ],
                },
                creator: creator || null,
            };

            return res.json(response);
        } catch (error) {
            console.error("Error in getStudentWithAssignment:", error);
            next(
                ApiError.internal(
                    "Ошибка при получении данных студента и задания"
                )
            );
        }
    }

    update = updateAssignment;

    // Удаление назначения

    delete = deleteAssignment;

    // Получение списка студентов с назначенниями

    getStudentsWithAssignments = getStudentsWithAssignments;
}

export default new AssignmentController();
