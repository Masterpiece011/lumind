import React, { memo } from "react";
import Text from "@/shared/ui/Text";

export const AssignmentCard = memo(({ assignment, onSelect }) => {
    const labels = {
        assigned: "Назначено",
        submitted: "Сдано на проверку",
        completed: "Выполнено",
        failed: "Провалено",
        in_progress: "В работе",
    };

    const isInstructorView = assignment.isInstructorView;

    const renderTeamInfo = (teamData) => {
        if (!teamData?.team) {
            return (
                <Text tag="p" className="text-medium">
                    Без команды ({teamData?.assignmentsCount || 0})
                </Text>
            );
        }

        return (
            <Text tag="p" className="text-medium">
                Команда:{" "}
                <span
                    style={{
                        color: teamData.team.avatar_color || "#000000",
                    }}
                >
                    {teamData.team.name || "Без названия"}
                </span>
            </Text>
        );
    };

    return (
        <li
            className={`assignments__card ${
                isInstructorView ? "assignments__card--instructor" : ""
            }`}
            onClick={() => onSelect(assignment.id)}
        >
            {!isInstructorView ? (
                // Рендер для студента
                <>
                    <div className="assignments__header">
                        <Text tag="span" className="assignments__status">
                            {labels[assignment.status] || assignment.status}
                        </Text>
                    </div>
                    <Text tag="h2" className="assignments__name">
                        {assignment.task?.title || "Неизвестное задание"}
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
                    {/* Добавляем блок с информацией о команде для студента */}
                    {assignment.team && (
                        <div className="assignments__team">
                            <Text tag="p" className="text-medium">
                                Команда:{" "}
                                <span
                                    style={{
                                        color:
                                            assignment.team.avatar_color ||
                                            "#000000",
                                    }}
                                >
                                    {assignment.team.name || "Без названия"}
                                </span>
                            </Text>
                        </div>
                    )}
                </>
            ) : (
                // Рендер для преподавателя (без изменений)
                <>
                    <Text tag="h2" className="assignments__name">
                        {assignment.task?.title || "Неизвестное задание"}
                    </Text>

                    <div className="assignments__meta">
                        <div className="assignments__count">
                            <Text tag="p" className="text-medium">
                                Назначений: {assignment.totalAssignments || 0}
                            </Text>
                        </div>

                        <div className="assignments__teams">
                            {assignment.teams
                                ?.slice(0, 2)
                                .map((teamData, index) => (
                                    <div
                                        key={index}
                                        className="assignments__team"
                                    >
                                        {renderTeamInfo(teamData)}
                                    </div>
                                ))}

                            {assignment.teams?.length > 2 && (
                                <div className="assignments__team-more">
                                    <Text tag="p" className="text-medium">
                                        и еще {assignment.teams.length - 2}{" "}
                                        команд...
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </li>
    );
});
