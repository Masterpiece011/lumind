import React, { memo } from "react";

export const AssignmentCard = memo(({ assignment, status, onSelect }) => {
    const labels = {
        assigned: "Назначено",
        submitted: "Сдано на проверку",
        completed: "Выполнено",
        failed: "Провалено",
        in_progress: "В работе",
    };

    return (
        <div
            className="assignments__card"
            onClick={() => onSelect(assignment.id)}
        >
            <div className="assignments__header">
                <span className="assignments__status">
                    {labels[status] || status}
                </span>
            </div>
            <h2 className="assignments__name">{assignment.title}</h2>
            <div className="assignments__deadline">
                <p>
                    Срок: {new Date(assignment.plan_date).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
});
