import { Assignments, Files, Teams_Tasks } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function deleteAssignment(req, res, next) {
    try {
        const { task_id } = req.body;

        if (!task_id) {
            return next(ApiError.badRequest("Необходимо указать ID задания"));
        }

        const assignment = await Assignments.findByPk(task_id);

        if (!assignment) {
            return next(ApiError.notFound("Задание не найдено"));
        }

        // Удаление связей в Assignments_Teams
        await Teams_Tasks.destroy({
            where: { assignment_id: task_id },
        });

        // Удаление задания и связанных вложений
        await Files.destroy({
            where: { assignment_id: task_id },
        });

        await assignment.destroy();

        return res.json({ message: "Задание успешно удалено" });
    } catch (error) {
        next(
            ApiError.internal(`Ошибка при удалении задания: ${error.message}`)
        );
    }
}
