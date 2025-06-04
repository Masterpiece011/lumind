import {
    Tasks,
    Assignments,
    Teams,
    Users,
    Files,
} from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";

export default async function getInstructorAssignments(req, res, next) {
    try {
        const { creator_id } = req.body;

        if (!creator_id) {
            return next(
                ApiError.badRequest("Необходимо указать ID преподавателя")
            );
        }

        const tasks = await Tasks.findAll({
            where: { creator_id },
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
        });

        const assignments = await Assignments.findAll({
            where: { creator_id },
            include: [
                {
                    model: Tasks,
                    as: "task",
                    required: true,
                },
            ],
            order: [["created_at", "DESC"]],
        });

        const userIds = [...new Set(assignments.map((a) => a.user_id))];
        const users = await Users.findAll({
            where: { id: userIds },
            attributes: ["id", "first_name", "last_name", "middle_name"],
        });
        const usersMap = new Map(
            users.map((u) => [u.id, u.get({ plain: true })])
        );
        const resultMap = new Map();

        tasks.forEach((task) => {
            const plainTask = task.get({ plain: true });
            resultMap.set(plainTask.id, {
                task: {
                    id: plainTask.id,
                    title: plainTask.title,
                    description: plainTask.description,
                    comment: plainTask.comment,
                    files: plainTask.files || [],
                },
                team: plainTask.teams?.[0] || null,
                assignments: [],
            });
        });

        assignments.forEach((assignment) => {
            const plainAssignment = assignment.get({ plain: true });
            const taskId = plainAssignment.task.id;

            if (!resultMap.has(taskId)) {
               
                resultMap.set(taskId, {
                    task: {
                        id: plainAssignment.task.id,
                        title: plainAssignment.task.title,
                        description: plainAssignment.task.description,
                        comment: plainAssignment.task.comment,
                        files: plainAssignment.task.files || [],
                    },
                    team: plainAssignment.task.teams?.[0] || null,
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
