import { Tasks, Teams, Teams_Tasks, Users } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getOneTeam(req, res, next) {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

        // Получаем основную информацию о команде
        const team = await Teams.findOne({
            where: { id },
            include: [
                {
                    model: Users,
                    as: "users",
                    attributes: ["id", "email", "first_name", "last_name"],
                    through: { attributes: [] },
                },
                {
                    model: Tasks,
                    through: Teams_Tasks,
                    attributes: ["id", "title", "description", "creator_id"],
                },
            ],
        });

        if (!team) {
            return next(ApiError.notFound(`Команда с ID: ${id} не найдена`));
        }

        const creator = await Users.findByPk(team.creator_id, {
            attributes: ["id", "first_name", "last_name", "display_name"],
        });

        const response = {
            id: team.id,
            name: team.name,
            description: team.description,
            avatar_color: team.avatar_color,
            creator: {
                id: creator.id,
                display_name: creator.display_name,
            },
            users: team.users,
            tasks: team.Tasks
                ? team.Tasks.map((task) => ({
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      creator_id: task.creator_id,
                  }))
                : [],
        };

        return res.json({ team: response });
    } catch (error) {
        next(
            ApiError.internal("Ошибка при получении команды: " + error.message)
        );
    }
}
