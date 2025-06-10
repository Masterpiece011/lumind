import { Assignments, Files, Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

import { Op } from "sequelize";

export default async function getUserFiles(req, res, next) {
    try {
        const {
            user_id,
            page = 1,
            quantity = 8,
            order = "DESC",
            search_text = "",
        } = req.body;

        if (!user_id) {
            return next(
                ApiError.badRequest("Необходимо указать ID пользователя")
            );
        }

        const offset = (page - 1) * quantity;

        const { count, rows: userFiles } = await Files.findAndCountAll({
            where: {
                entity_type: "assignment",
                ...(search_text && {
                    [Op.or]: [
                        { file_url: { [Op.iLike]: `%${search_text}%` } },
                        { original_name: { [Op.iLike]: `%${search_text}%` } },
                        {
                            "$assignment.task.title$": {
                                [Op.iLike]: `%${search_text}%`,
                            },
                        },
                    ],
                }),
            },
            include: [
                {
                    model: Assignments,
                    as: "assignment",
                    required: true,
                    where: { user_id },
                    attributes: ["id", "created_at"],
                    include: [
                        {
                            model: Tasks,
                            as: "task",
                            attributes: ["title"],
                        },
                    ],
                },
            ],
            order: [[order === "DESC" ? "created_at" : "created_at", order]],
            limit: quantity,
            offset: offset,
            distinct: true,
        });

        const formattedFiles = userFiles.map((file) => ({
            id: file.id,
            file_url: file.file_url,
            original_name: file.original_name,
            created_at: file.created_at,
            assignmentTitle: file.assignment?.task?.title || "Ответ на задание", // Используем title задачи
            taskTitle: file.assignment?.task?.title || "Неизвестное задание",
        }));

        return res.json({
            files: formattedFiles,
            total: count,
            page,
            totalPages: Math.ceil(count / quantity),
        });
    } catch (error) {
        console.error("Controller error:", error);
        next(
            ApiError.internal(`Ошибка при получении файлов: ${error.message}`)
        );
    }
}
