import { Tasks, Users, Files, Assignments } from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";

export default async function createAssignment(req, res, next) {
    try {
        const { creator_id, user_id, task_id, status, plan_date } = req.body;

        if (!creator_id || !user_id || !task_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать: creator_id, user_id и task_id"
                )
            );
        }

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

        const [creator, user] = await Promise.all([
            Users.findByPk(creator_id),
            Users.findByPk(user_id),
        ]);

        if (!creator || !user) {
            return next(ApiError.badRequest("Пользователь не найден"));
        }

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
                task_files: task.files || [],
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
