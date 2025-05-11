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
    console.log(assignment);

    return (
        <li
            className="assignments__card"
            onClick={() => onSelect(assignment.id)}
        >
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
                    Срок: {new Date(assignment.plan_date).toLocaleDateString()}
                </Text>
            </div>
        </li>
    );
});
