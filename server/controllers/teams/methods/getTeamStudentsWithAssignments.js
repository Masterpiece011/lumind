import {
    Assignments,
    Files,
    Groups,
    Tasks,
    Teams,
    Users,
    Users_Teams,
} from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";

export default async function getTeamStudentsWithAssignments(req, res, next) {
    try {
        const { teamId } = req.params;
        const { task_id, creator_id } = req.body;

        // 1. Получаем всех пользователей команды
        const teamUsers = await Users_Teams.findAll({
            where: { team_id: teamId },
            attributes: ["user_id"],
            raw: true,
        });

        if (teamUsers.length === 0) {
            return res.json({
                students: [],
                total: 0,
            });
        }

        const studentIds = teamUsers.map((u) => u.user_id);

        // 2. Получаем студентов с назначениями
        const where = {
            creator_id,
            user_id: studentIds,
            ...(task_id ? { task_id } : {}),
        };

        const assignments = await Assignments.findAll({
            where,
            attributes: ["user_id"],
            group: ["user_id"],
            raw: true,
        });

        const studentsWithAssignments = await Promise.all(
            assignments.map(async ({ user_id }) => {
                const student = await Users.findByPk(user_id, {
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
                    ],
                });

                const studentAssignments = await Assignments.findAll({
                    where: {
                        creator_id,
                        user_id: student.id,
                        ...(task_id ? { task_id } : {}),
                    },
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

                return {
                    ...student.get({ plain: true }),
                    assignments: studentAssignments.map((a) => ({
                        id: a.id,
                        status: a.status,
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
            total: assignments.length,
        });
    } catch (error) {
        next(ApiError.internal("Ошибка при получении студентов команды"));
    }
}
