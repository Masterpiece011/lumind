import {
    Tasks,
    Users,
    Files,
    Assignments,
    Teams,
} from "../../../models/models.js";
import ApiError from "../../../error/ApiError.js";

export default async function createAssignment(req, res, next) {
    try {
        const { creator_id, user_id, task_id, team_id, plan_date, status } =
            req.body;

        // Валидация обязательных полей
        if (!creator_id || !user_id || !task_id) {
            return next(
                ApiError.badRequest(
                    "Необходимо указать creator_id, user_id и task_id"
                )
            );
        }

        // Проверка существования задачи
        const task = await Tasks.findByPk(task_id, {
            include: [
                {
                    model: Files,
                    as: "files",
                    where: { entity_type: "task" },
                    required: false,
                },
                {
                    model: Teams,
                    as: "teams",
                    through: { attributes: [] },
                    required: false,
                    where: team_id ? { id: team_id } : undefined,
                },
            ],
        });

        if (!task) {
            return next(ApiError.badRequest("Задание не найдено"));
        }

        // Проверка существования пользователей
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

        // Получаем команду, если она указана
        let team = null;
        if (team_id) {
            team = await Teams.findByPk(team_id);
        }

        // Формируем полный ответ с информацией о задании и пользователе
        const response = {
            message: "Назначение успешно создано",
            assignment: {
                ...assignment.get({ plain: true }),
                task: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    comment: task.comment,
                    files: task.files || [],
                },
                team: team
                    ? {
                          id: team.id,
                          name: team.name,
                          description: team.description,
                          avatar_color: team.avatar_color,
                      }
                    : null,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    middle_name: user.middle_name,
                },
            },
        };

        return res.status(201).json(response);
    } catch (error) {
        console.error("Ошибка создания назначения:", error);
        next(
            ApiError.internal(
                `Ошибка при создании назначения: ${error.message}`
            )
        );
    }
}
