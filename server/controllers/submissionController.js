import dotenv from "dotenv";
dotenv.config();

import path from "path";

import {
    Submissions,
    Submissions_investments,
    Assignments_Teams,
    Users_Teams
} from "../models/models.js";

import ApiError from "../error/ApiError.js";
import FileService from "../multer/fileService.js";

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

            // Фильтруем null или недопустимые значения
            const validInvestments = investments.filter((fileUrl) => {
                return typeof fileUrl === "string" && fileUrl.trim() !== "";
            });

            // Перемещение файлов из временной папки в основную
            const movedFiles = await FileService.moveFilesFromTemp(
                validInvestments,
                path.resolve(__dirname, "..", "uploads")
            );

            // Очистка временных файлов
            await FileService.cleanupTempFiles(validInvestments);

            // Получение всех команд, к которым относится пользователь
            const userTeams = await Users_Teams.findAll({
                where: { user_id: user_id },
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
                    assignment_id: assignment_id,
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
            if (movedFiles.length > 0) {
                const investmentRecords = movedFiles.map((fileUrl) => ({
                    submission_id: submission.id,
                    file_url: fileUrl,
                }));
                await Submissions_investments.bulkCreate(investmentRecords);
            }

            // Получаем отправку с вложениями
            const submissionWithInvestments = await Submissions.findOne({
                where: { id: submission.id },
                include: [
                    {
                        model: Submissions_investments,
                        attributes: ["id", "file_url"],
                    },
                ],
            });

            return res.json({
                message: "Отправка успешно создана",
                submission: submissionWithInvestments,
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
            const { submission_id, comment, investments = [] } = req.body;

            if (!submission_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID отправки")
                );
            }

            const submission = await Submissions.findByPk(submission_id);

            if (!submission) {
                return next(ApiError.notFound("Отправка не найдена"));
            }

            // Обновление комментария
            await submission.update({ comment: comment || submission.comment });

            // Обновление вложений
            if (investments.length > 0) {
                await Submissions_investments.destroy({
                    where: { submission_id: submission_id },
                });
                const investmentRecords = investments.map((fileUrl) => ({
                    submission_id: submission_id,
                    file_url: fileUrl,
                }));
                await Submissions_investments.bulkCreate(investmentRecords);
            }

            return res.json({
                message: "Отправка успешно обновлена",
                submission: submission,
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
            const { submission_id } = req.body;

            if (!submission_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID отправки")
                );
            }

            // Находим отправку с вложениями
            const submission = await Submissions.findByPk(submission_id, {
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

            console.log("Вызов deleteEntityFiles для удаления файлов");
            // Удаляем связанные файлы из папки uploads
            await deleteEntityFiles(
                submission,
                "submissions_investments",
                "uploads"
            );
            console.log("Функция deleteEntityFiles выполнена");

            // Удаляем записи из базы данных
            await Submissions_investments.destroy({
                where: { submission_id: submission_id },
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
            const { submission_id } = req.params;

            if (!submission_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID отправки")
                );
            }

            const submission = await Submissions.findOne({
                where: { id: submission_id },
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

            return res.json({ submission: submission });
        } catch (error) {
            console.log("Ошибка получения назначения", error);

            next(
                ApiError.internal(
                    `Ошибка при получении отправки: ${error.message}`
                )
            );
        }
    }
}

export default new SubmissionController();
