import { Files, Tasks, Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getTeamFiles(req, res, next) {
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
