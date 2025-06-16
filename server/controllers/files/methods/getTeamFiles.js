import { Files, Tasks, Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getTeamFiles(req, res, next) {
    try {
        const { teamId } = req.params;
        const { page = 1, quantity = 10 } = req.body;

        console.log(`Fetching files for team ${teamId}`);

        const teamTasks = await Teams_Tasks.findAll({
            where: { team_id: teamId },
            attributes: ["task_id"],
            raw: true,
        });

        console.log("Found team tasks:", teamTasks);

        const taskIds = teamTasks.map((t) => t.task_id);

        if (taskIds.length === 0) {
            console.log("No tasks found for this team");
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
                    required: false,
                },
            ],
            limit: quantity,
            offset: offset,
            order: [["created_at", "DESC"]],
            raw: true,
            nest: true,
        });

        console.log("Found files:", files);

        const formattedFiles = files.map((file) => ({
            id: file.id,
            file_url: file.file_url,
            original_name: file.original_name,
            size: file.size,
            mime_type: file.mime_type,
            created_at: file.created_at,
            taskId: file.task?.id,
            taskTitle: file.task?.title || "Файл задания",
        }));

        return res.json({
            files: formattedFiles,
            total: count,
            page,
            totalPages: Math.ceil(count / quantity),
        });
    } catch (error) {
        console.error("Error in getTeamFiles:", error);
        next(ApiError.internal(error.message));
    }
}
