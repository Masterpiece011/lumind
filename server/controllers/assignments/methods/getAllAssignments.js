import { Tasks, Assignments, Users_Teams, Teams_Tasks } from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";

export default async function getAllAssignments(req, res, next) {
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
                    ApiError.forbidden("Пользователь не состоит в этой команде")
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
        const { count, rows: assignments } = await Assignments.findAndCountAll({
            where: whereCondition,
            include: [{ model: Tasks, as: "task" }],
            distinct: true,
        });

        return res.json({ assignments, total: count });
    } catch (error) {
        next(
            ApiError.internal(`Ошибка при получении заданий: ${error.message}`)
        );
    }
}
