import { Tasks, Assignments, Files } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function updateAssignment(req, res, next) {
    try {
        const {
            assignment_id,
            title,
            description,
            plan_date,
            comment,
            assessment,
            status,
            user_id,
        } = req.body;

        if (!assignment_id) {
            return next(
                ApiError.badRequest("Необходимо указать ID назначения")
            );
        }

        const assignment = await Assignments.findByPk(assignment_id);

        if (!assignment) {
            return next(ApiError.notFound("Назначение не найдено"));
        }

        await assignment.update({
            title: title || assignment.title,
            description: description || assignment.description,
            comment: comment || assignment.comment,
            assessment: assessment || assignment.assessment,
            status: status || assignment.status,
            plan_date: plan_date || assignment.plan_date,
            user_id: user_id || assignment.user_id,
        });

        const updatedAssignment = await Assignments.findByPk(assignment_id, {
            include: [
                {
                    model: Tasks,
                    as: "task",
                    include: [
                        {
                            model: Files,
                            as: "files",
                            where: { entity_type: "task" },
                            required: false,
                        },
                    ],
                },
                {
                    model: Files,
                    as: "files",
                    where: { entity_type: "assignment" },
                    required: false,
                },
            ],
        });

        const responseData = updatedAssignment.get({ plain: true });

        return res.json({
            message: "Назначение успешно обновлено",
            assignment: {
                ...responseData,
                task_files: responseData.task?.files || [],
                assignment_files: responseData.files || [],
            },
        });
    } catch (error) {
        next(
            ApiError.internal(
                `Ошибка при обновлении назначения: ${error.message}`
            )
        );
    }
}
