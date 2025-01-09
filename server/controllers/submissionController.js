require("dotenv").config();
const {
    Submissions,
    Submissions_investments,
    Assignments_Teams,
    Users_Teams,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class SubmissionController {
    // Метод создания отправки задания
    async create(req, res, next) {
        try {
            const {
                user_id,
                assignment_id,
                comment,
                investments = [],
            } = req.body;

            // Проверка наличия обязательных полей
            if (!user_id || !assignment_id) {
                return next(
                    ApiError.badRequest(
                        "Необходимо указать user_id и assignment_id"
                    )
                );
            }

            // Получение всех команд, к которым относится пользователь
            const userTeams = await Users_Teams.findAll({
                where: { user_id },
                attributes: ["team_id"],
            });

            if (!userTeams || userTeams.length === 0) {
                return next(
                    ApiError.forbidden("Пользователь не состоит в командах")
                );
            }

            // Извлечение идентификаторов команд
            const teamIds = userTeams.map((team) => team.team_id);

            // Проверка связи задания с командами пользователя через Assignments_Teams
            const assignmentTeamLink = await Assignments_Teams.findOne({
                where: {
                    assignment_id,
                    team_id: teamIds,
                },
            });

            if (!assignmentTeamLink) {
                return next(
                    ApiError.forbidden(
                        "Пользователь не имеет доступа к этому заданию"
                    )
                );
            }

            // Создание отправки задания
            const submission = await Submissions.create({
                user_id,
                assignment_id,
                comment,
                submitted_date: new Date(),
            });

            // Добавление вложений, если они указаны
            if (investments.length > 0) {
                const investmentRecords = investments.map((fileUrl) => ({
                    submission_id: submission.id,
                    file_url: fileUrl,
                }));
                await Submissions_investments.bulkCreate(investmentRecords);
            }

            // Возвращение успешного результата
            return res.json({
                message: "Отправка успешно создана",
                submission,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при создании отправки: ${error.message}`
                )
            );
        }
    }

    // Обновление отправки
    async update(req, res, next) {
        try {
            const { id, comment, investments = [] } = req.body;

            if (!id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID отправки")
                );
            }

            const submission = await Submissions.findByPk(id);

            if (!submission) {
                return next(ApiError.notFound("Отправка не найдена"));
            }

            // Обновление комментария
            await submission.update({ comment: comment || submission.comment });

            // Обновление вложений
            if (investments.length > 0) {
                await Submissions_investments.destroy({
                    where: { submission_id: id },
                });
                const investmentRecords = investments.map((fileUrl) => ({
                    submission_id: id,
                    file_url: fileUrl,
                }));
                await Submissions_investments.bulkCreate(investmentRecords);
            }

            return res.json({
                message: "Отправка успешно обновлена",
                submission,
            });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при обновлении отправки: ${error.message}`
                )
            );
        }
    }

    // Удаление отправки
    async delete(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID отправки")
                );
            }

            const submission = await Submissions.findByPk(id);

            if (!submission) {
                return next(ApiError.notFound("Отправка не найдена"));
            }

            await Submissions_investments.destroy({
                where: { submission_id: id },
            });
            await submission.destroy();

            return res.json({ message: "Отправка успешно удалена" });
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при удалении отправки: ${error.message}`
                )
            );
        }
    }

    // Получение всех отправок для задания
    async getAll(req, res, next) {}

    // Получение одной отправки
    async getOne(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID отправки")
                );
            }

            const submission = await Submissions.findOne({
                where: { id },
                include: [
                    {
                        model: Submissions_investments,
                        attributes: ["id", "file_url"],
                    },
                ],
            });

            if (!submission) {
                return next(ApiError.notFound("Отправка не найдена"));
            }

            return res.json(submission);
        } catch (error) {
            next(
                ApiError.internal(
                    `Ошибка при получении отправки: ${error.message}`
                )
            );
        }
    }
}

module.exports = new SubmissionController();
