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
            const { team_id, title, link, duration, session_date, creatorId } =
                req.body;

            // Проверяем, существует ли команда
            const team = await Teams.findByPk(team_id);
            if (!team) {
                return next(ApiError.badRequest("Команда не найдена"));
            }

            // Получаем участников команды
            const teamMembers = await Users_Teams.findAll({
                where: { team_id: team_id },
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
            console.log("Ошибка создания записи", error);

            next(ApiError.internal(error.message));
        }
    }

    // Обновление собрания

    async update(req, res, next) {
        try {
            const { team_conference_id, title, link, duration, session_date } =
                req.body;

            const conference = await Conferences.findByPk(team_conference_id);
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
            const { team_id } = req.body;

            const conferences = await Conferences.findAll({
                include: [
                    {
                        model: Conference_Members,
                        include: [{ model: Users }],
                    },
                ],
                where: team_id ? { team_id: team_id } : {},
            });

            return res.json(conferences);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Получение конкретного собрания

    async getOne(req, res, next) {
        try {
            const { team_conference_id } = req.body;

            const conference = await Conferences.findByPk(team_conference_id, {
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

            return res.json({conference: conference});
        } catch (error) {
            console.log("Ошибка получения", error);
            
            next(ApiError.internal(error.message));
        }
    }
}

module.exports = new teamConferenceController();
