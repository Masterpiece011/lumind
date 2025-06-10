import {
    Tasks,
    Assignments,
    Teams,
    Users,
    Files,
} from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";
import { Sequelize } from "sequelize";

export default async function getInstructorAssignments(req, res, next) {
    try {
        const { creator_id } = req.body;

        if (!creator_id) {
            return next(
                ApiError.badRequest("Необходимо указать ID преподавателя")
            );
        }

        // 1. Получаем только последние назначения для каждого пользователя и задачи
        const latestAssignments = await Assignments.findAll({
            attributes: [
                [Sequelize.fn("MAX", Sequelize.col("id")), "latest_id"],
            ],
            where: { creator_id },
            group: ["task_id", "user_id"],
            raw: true,
        });

        const latestAssignmentIds = latestAssignments.map((a) => a.latest_id);

        // 2. Получаем полные данные по последним назначениям
        const assignments = await Assignments.findAll({
            where: { id: latestAssignmentIds },
            include: [
                {
                    model: Tasks,
                    as: "task",
                    required: true,
                    include: [
                        {
                            model: Teams,
                            as: "teams",
                            through: { attributes: [] },
                            required: false,
                        },
                        {
                            model: Files,
                            as: "files",
                            where: { entity_type: "task" },
                            required: false,
                        },
                    ],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // 3. Получаем пользователей
        const userIds = [...new Set(assignments.map((a) => a.user_id))];
        const users = await Users.findAll({
            where: { id: userIds },
            attributes: ["id", "first_name", "last_name", "middle_name"],
        });
        const usersMap = new Map(
            users.map((u) => [u.id, u.get({ plain: true })])
        );

        // 4. Группируем задания по задачам
        const resultMap = new Map();

        assignments.forEach((assignment) => {
            const plainAssignment = assignment.get({ plain: true });
            const task = plainAssignment.task;
            const taskId = task.id;

            if (!resultMap.has(taskId)) {
                resultMap.set(taskId, {
                    task: {
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        comment: task.comment,
                        files: task.files || [],
                    },
                    team: task.teams?.[0] || null,
                    assignments: [],
                });
            }

            resultMap.get(taskId).assignments.push({
                id: plainAssignment.id,
                status: plainAssignment.status,
                plan_date: plainAssignment.plan_date,
                user_id: plainAssignment.user_id,
                user: usersMap.get(plainAssignment.user_id) || null,
            });
        });

        const result = Array.from(resultMap.values());
        const totalAssignments = assignments.length;

        return res.json({
            assignmentsByTask: result,
            total: totalAssignments,
        });
    } catch (error) {
        console.error("Ошибка в getInstructorAssignments:", error);
        next(
            ApiError.internal(
                `Ошибка при получении назначений: ${error.message}`
            )
        );
    }
}
