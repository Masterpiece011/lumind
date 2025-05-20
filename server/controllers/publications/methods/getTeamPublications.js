import { Publications, Teams } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getTeamPublications(req, res, next) {
    try {
        const { team_id } = req.body;

        const team = await Teams.findByPk(team_id);

        if (!team) {
            return next(ApiError.badRequest("Команды не существует"));
        }

        const { count, rows: publications } =
            await Publications.findAndCountAll({
                where: { team_id },
                attributes: { exclude: ["published_at"] },
            });

        return res.json({ publications: publications, total: count });
    } catch (error) {
        console.log("Ошибка получения публикаций команды", error);

        return ApiError.internal("Ошибка получения публикаций команды");
    }
}
