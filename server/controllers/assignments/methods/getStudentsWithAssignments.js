import {
    Assignments,
    Files,
    Groups,
    Tasks,
    Teams,
    Users,
} from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";

export default async function getStudentsWithAssignments(req, res, next) {
    try {
        const userId = req.user.id;
        const { task_id, team_id, page = 1, quantity = 10 } = req.body;

        const offset = (page - 1) * quantity;

        // 1. Получаем студентов с назначениями
        const studentAssignments = await Assignments.findAll({
            where: { creator_id: userId },
            attributes: ["user_id"],
            group: ["user_id"],
            raw: true,
        });

        if (studentAssignments.length === 0) {
            return res.json({
                students: [],
                total: 0,
                currentPage: page,
                totalPages: 0,
            });
        }

        const studentIds = studentAssignments
            .map((a) => a.user_id)
            .filter((id) => id !== userId);

        // 2. Формируем условия для фильтрации по команде
        const teamFilter = {};
        if (team_id === "other") {
            teamFilter["$teams.id$"] = null; // Студенты без команды
        } else if (team_id) {
            teamFilter["$teams.id$"] = team_id;
        }

        // 3. Получаем студентов с пагинацией
        const { count, rows: students } = await Users.findAndCountAll({
            where: {
                id: studentIds,
                ...(Object.keys(teamFilter).length ? teamFilter : {}),
            },
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
                    required: team_id !== "other" && !!team_id,
                },
            ],
            limit: quantity,
            offset: offset,
            distinct: true,
            subQuery: false,
        });

        // 4. Получаем задания для каждого студента
        const studentsWithAssignments = await Promise.all(
            students.map(async (student) => {
                const where = {
                    creator_id: userId,
                    user_id: student.id,
                    ...(task_id ? { task_id } : {}),
                };

                const assignments = await Assignments.findAll({
                    where,
                    attributes: [
                        "id",
                        "status",
                        "assessment",
                        "comment",
                        "plan_date",
                        "created_at",
                        "task_id",
                    ],
                    include: [
                        {
                            model: Tasks,
                            attributes: ["id", "title", "description"],
                            include: [
                                {
                                    model: Files,
                                    where: { entity_type: "task" },
                                    required: false,
                                    attributes: [
                                        "id",
                                        "file_url",
                                        "original_name",
                                    ],
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

                // Оставляем только последние задания по каждой задаче
                const uniqueAssignments = [];
                const taskMap = new Map();

                assignments.forEach((assignment) => {
                    if (!taskMap.has(assignment.task_id)) {
                        taskMap.set(assignment.task_id, true);
                        uniqueAssignments.push(assignment);
                    }
                });

                return {
                    ...student.get({ plain: true }),
                    assignments: uniqueAssignments.map((a) => ({
                        id: a.id,
                        status: a.status,
                        assessment: a.assessment,
                        comment: a.comment,
                        plan_date: a.plan_date,
                        created_at: a.created_at,
                        task: {
                            id: a.task.id,
                            title: a.task.title,
                            description: a.task.description,
                            files: a.task.files || [],
                        },
                        files: a.files || [],
                    })),
                };
            })
        );

        return res.json({
            students: studentsWithAssignments,
            total: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / quantity),
            taskId: task_id || null,
            teamId: team_id || null,
        });
    } catch (error) {
        console.error("Error in getStudentsWithAssignments:", error);
        next(ApiError.internal("Ошибка при получении списка студентов"));
    }
}
