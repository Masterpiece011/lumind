import { Op } from "sequelize";
import { Files, Assignments, Tasks, Teams_Tasks } from "../models/models.js";
import ApiError from "../error/ApiError.js";

import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

import FileService from "../multer/fileService.js";
import { fileConfig } from "../multer/multerConfig.js";

class FileController {
    async getUserFiles(req, res, next) {
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
                            {
                                "$assignment.title$": {
                                    [Op.iLike]: `%${search_text}%`,
                                },
                            },
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
                        attributes: ["id", "title", "created_at"],
                        include: [
                            {
                                model: Tasks,
                                as: "task",
                                attributes: ["title"],
                            },
                        ],
                    },
                ],
                order: [
                    [order === "DESC" ? "created_at" : "created_at", order],
                ],
                limit: quantity,
                offset: offset,
                distinct: true,
            });

            const formattedFiles = userFiles.map((file) => ({
                id: file.id,
                file_url: file.file_url,
                original_name: file.file_url.split("/").pop(),
                created_at: file.created_at,
                assignmentTitle: file.assignment?.title || "Ответ на задание",
                taskTitle:
                    file.assignment?.task?.title || "Неизвестное задание",
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
                ApiError.internal(
                    `Ошибка при получении файлов: ${error.message}`
                )
            );
        }
    }

    async getTeamFiles(req, res, next) {
        try {
            const { teamId } = req.params;
            const { page = 1, quantity = 10 } = req.body;

            const teamTasks = await Teams_Tasks.findAll({
                where: { team_id: teamId },
                attributes: ["task_id"],
            });

            const taskIds = teamTasks.map((t) => t.task_id);
            if (taskIds.length === 0) {
                return res.json({
                    files: [],
                    total: 0,
                    page,
                    totalPages: 0,
                });
            }

            const offset = (page - 1) * quantity;
            const { count, rows: files } = await Files.findAndCountAll({
                where: {
                    entity_id: taskIds,
                    entity_type: "task",
                },
                include: [
                    {
                        model: Tasks,
                        attributes: ["id", "title"],
                    },
                ],
                limit: quantity,
                offset: offset,
                order: [["created_at", "DESC"]],
            });

            const formattedFiles = files.map((file) => ({
                id: file.id,
                file_url: file.file_url,
                taskTitle: file.Task?.title || "Файл задания",
                taskId: file.Task?.id,
            }));

            return res.json({
                files: formattedFiles,
                total: count,
                page,
                totalPages: Math.ceil(count / quantity),
            });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async upload(req, res, next) {
        try {
            if (!req.file) {
                throw ApiError.badRequest("No file uploaded");
            }

            const result = await FileService.promoteTempFile(
                req.file.path,
                req.body.entityType || "general"
            );

            if (!result.success) {
                throw ApiError.internal("File processing failed");
            }

            res.json({
                url: `/uploads/${result.relativePath}`,
                originalName: req.file.originalname,
                size: req.file.size,
            });
        } catch (error) {
            await FileService.delete(req.file?.path);
            next(error);
        }
    }

    async download(req, res, next) {
        try {
            const filePath = path.join(
                fileConfig.UPLOADS_BASE_DIR,
                req.params.path
            );

            if (
                !(await fs
                    .access(filePath)
                    .then(() => true)
                    .catch(() => false))
            ) {
                throw ApiError.notFound("File not found");
            }

            res.download(filePath);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const filePath = path.join(
                fileConfig.UPLOADS_BASE_DIR,
                req.params.path
            );
            const result = await FileService.delete(filePath);

            if (!result.success) {
                throw ApiError.internal("File deletion failed");
            }

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

export default new FileController();
