import {
    Assignments,
    Files,
    Tasks,
    Teams,
    Teams_Tasks,
    Users,
} from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";
import { Sequelize } from "sequelize";

export default async function getTeamInstructorAssignments(req, res, next) {
    try {
        const { teamId } = req.params;
        const { creator_id } = req.body;

        // 1. Получаем задачи преподавателя, связанные с командой
        const teamTasks = await Teams_Tasks.findAll({
            where: { team_id: teamId },
            include: [
                {
                    model: Tasks,
                    where: { creator_id },
                    include: [
                        {
                            model: Files,
                            where: { entity_type: "task" },
                            required: false,
                        },
                    ],
                },
            ],
        });

        const taskIds = teamTasks.map((t) => t.task_id);

        // 2. Получаем последние назначения для этих задач
        const latestAssignments = await Assignments.findAll({
            attributes: [
                [Sequelize.fn("MAX", Sequelize.col("id")), "latest_id"],
            ],
            where: {
                task_id: taskIds,
                creator_id,
            },
            group: ["task_id", "user_id"],
            raw: true,
        });

        const latestAssignmentIds = latestAssignments.map((a) => a.latest_id);

        // 3. Получаем полные данные по последним назначениям
        const assignments = await Assignments.findAll({
            where: { id: latestAssignmentIds },
            include: [
                {
                    model: Tasks,
                    as: "task",
                    include: [
                        {
                            model: Teams,
                            as: "teams",
                            where: { id: teamId },
                            through: { attributes: [] },
                            required: true,
                        },
                        {
                            model: Files,
                            as: "files",
                            required: false,
                        },
                    ],
                },
                {
                    model: Users,
                    as: "user",
                    attributes: [
                        "id",
                        "first_name",
                        "last_name",
                        "middle_name",
                    ],
                    required: true,
                },
            ],
        });

        // 4. Группируем по задачам
        const result = assignments.reduce((acc, assignment) => {
            const taskId = assignment.task.id;
            if (!acc[taskId]) {
                acc[taskId] = {
                    task: assignment.task,
                    team: assignment.task.teams[0],
                    assignments: [],
                };
            }
            acc[taskId].assignments.push({
                id: assignment.id,
                status: assignment.status,
                user: assignment.user,
                plan_date: assignment.plan_date,
            });
            return acc;
        }, {});

        return res.json({
            assignmentsByTask: Object.values(result),
            total: assignments.length,
        });
    } catch (error) {
        next(
            ApiError.internal(
                `Ошибка при получении заданий преподавателя: ${error.message}`
            )
        );
    }
}
