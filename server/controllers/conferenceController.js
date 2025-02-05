require("dotenv").config();
const { Users, Conferences, Conference_Members } = require("../models/models");
const ApiError = require("../error/ApiError");
class ConferenceController {
    // Создание звонка
    async create(req, res, next) {
        try {
            const {
                user_ids,
                title,
                link,
                duration,
                session_date,
                creator_id,
            } = req.body;

            // Проверяем, существуют ли пользователи
            const users = await Users.findAll({ where: { id: user_ids } });
            if (users.length !== user_ids.length) {
                return next(
                    ApiError.badRequest("Некоторые пользователи не найдены")
                );
            }

            // Создаём конференцию
            const conference = await Conferences.create({
                title: title,
                link: link,
                duration: duration,
                sesstion_date: session_date,
                creator_id: creator_id,
            });

            // Добавляем участников в конференцию
            await Conference_Members.bulkCreate(
                user_ids.map((userId) => ({
                    user_id: userId,
                    conference_id: conference.id,
                }))
            );

            return res.status(201).json(conference);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Обновление звонка
    async update(req, res, next) {
        try {
            const { conference_id, title, link, duration, session_date } =
                req.body;

            const conference = await Conferences.findByPk(conference_id);
            if (!conference) {
                return next(ApiError.badRequest("Конференция не найдена"));
            }

            conference.title = title || conference.title;
            conference.link = link || conference.link;
            conference.duration = duration || conference.duration;
            conference.session_date = session_date || conference.session_date;

            await conference.save();
            return res.json({conference: conference});
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Получение всех звонков
    async getAll(req, res, next) {
        try {
            const conferences = await Conferences.findAll({
                include: [
                    {
                        model: Conference_Members,
                        include: [{ model: Users }],
                    },
                ],
            });

            return res.json(conferences);
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    // Получение конкретного звонка
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

module.exports = new ConferenceController();
