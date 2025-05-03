import { Files, Assignments, Tasks } from "../models/models.js";
import ApiError from "../error/ApiError.js";

class FileController {
    async getUserFiles(req, res, next) {
        try {
            const { user_id } = req.query;
            console.log("Requested files for user:", user_id);

            if (!user_id) {
                return next(
                    ApiError.badRequest("Необходимо указать ID пользователя")
                );
            }

            const userFiles = await Files.findAll({
                where: {
                    entity_type: "assignment",
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
                order: [["created_at", "DESC"]],
                limit: 8,
            });

            console.log("Found files:", userFiles.length);

            const formattedFiles = userFiles.map((file) => ({
                id: file.id,
                file_url: file.file_url,
                original_name: file.file_url.split("/").pop(),
                created_at: file.created_at,
                assignmentTitle: file.assignment?.title || "Ответ на задание",
                taskTitle:
                    file.assignment?.task?.title || "Неизвестное задание",
            }));

            return res.json({ files: formattedFiles });
        } catch (error) {
            console.error("Controller error:", error);
            next(
                ApiError.internal(
                    `Ошибка при получении файлов: ${error.message}`
                )
            );
        }
    }
}

export default new FileController();
