require("dotenv").config();
const {
    Users,
    Teams,
    Users_Teams,
    Conferences,
    Conference_Members,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class teamConferenceController {
    // Создание собрания для команды
    async create(req, res, next) {
        try {
            const { teamId, title, link, duration, session_date, creatorId } =
                req.body;

            // Проверяем, существует ли команда
            const team = await Teams.findByPk(teamId);
            if (!team) {
                return next(ApiError.badRequest("Команда не найдена"));
            }

            // Получаем участников команды
            const teamMembers = await Users_Teams.findAll({
                where: { team_id: teamId },
            });
            if (!teamMembers.length) {
                return next(ApiError.badRequest("В команде нет участников"));
            }

            // Создаём конференцию
            const conference = await Conferences.create({
                title,
                link,
                duration,
                session_date,
                creator_id: creatorId,
            });

            // Добавляем участников в конференцию
            await Conference_Members.bulkCreate(
                teamMembers.map((member) => ({
                    user_id: member.user_id,
                    conference_id: conference.id,
                }))
            );

            return res.status(201).json(conference);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Обновление собрания
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, link, duration, session_date } = req.body;

            const conference = await Conferences.findByPk(id);
            if (!conference) {
                return next(ApiError.badRequest("Конференция не найдена"));
            }

            conference.title = title || conference.title;
            conference.link = link || conference.link;
            conference.duration = duration || conference.duration;
            conference.session_date = session_date || conference.session_date;

            await conference.save();
            return res.json(conference);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Получение всех собраний команды
    async getAll(req, res, next) {
        try {
            const { teamId } = req.query;

            const conferences = await Conferences.findAll({
                include: [
                    {
                        model: Conference_Members,
                        include: [{ model: Users }],
                    },
                ],
                where: teamId ? { team_id: teamId } : {},
            });

            return res.json(conferences);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Получение конкретного собрания
    async getOne(req, res, next) {
        try {
            const { id } = req.params;

            const conference = await Conferences.findByPk(id, {
                include: [
                    {
                        model: Conference_Members,
                        include: [{ model: Users }],
                    },
                ],
            });

            if (!conference) {
                return next(ApiError.badRequest("Конференция не найдена"));
            }

            return res.json(conference);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }
}

module.exports = new teamConferenceController();
