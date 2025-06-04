import React, { memo } from "react";
import Text from "@/shared/ui/Text";

export const AssignmentCard = memo(({ assignment, status, onSelect }) => {
    const labels = {
        assigned: "Назначено",
        submitted: "Сдано на проверку",
        completed: "Выполнено",
        failed: "Провалено",
        in_progress: "В работе",
    };

    // Проверяем, является ли это представлением инструктора
    const isInstructorView = assignment.isInstructorView;

    return (
        <li
            className="assignments__card"
            onClick={() => onSelect(assignment.id)}
        >
            {!isInstructorView ? (
                <>
                    <div className="assignments__header">
                        <Text tag="span" className="assignments__status">
                            {labels[status] || status}
                        </Text>
                    </div>
                    <Text tag="h2" className="assignments__name">
                        {assignment.task.title}
                    </Text>
                    <div className="assignments__deadline">
                        <Text tag="p">
                            Срок:{" "}
                            {assignment.plan_date
                                ? new Date(
                                      assignment.plan_date,
                                  ).toLocaleDateString()
                                : "Не указан"}
                        </Text>
                    </div>
                </>
            ) : (
                <>
                    <Text tag="h2" className="assignments__name">
                        {assignment.task.title}
                    </Text>

                    <div className="assignments__count"></div>
                    {assignment.team && (
                        <div className="assignments__team">
                            <Text tag="p" className="text-medium">
                                Команда:{" "}
                                <span
                                    style={{
                                        color: assignment.team.avatar_color,
                                    }}
                                >
                                    {assignment.team.name}
                                </span>
                            </Text>
                        </div>
                    )}
                </>
            )}
        </li>
    );
});
