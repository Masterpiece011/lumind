import React, { memo, useCallback } from "react";
import { MyButton } from "@/shared/uikit/MyButton";
import Text from "@/shared/ui/Text";
import "./TeamFilter.scss";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

export const TeamButton = memo(({ text, isActive, onClick, disabled }) => {
    return (
        <MyButton
            text={text}
            onClick={onClick}
            className={isActive ? "active" : ""}
            disabled={disabled}
        />
    );
});

export const TeamFilter = memo(
    ({ teams, currentTeam, onTeamChange, taskTitle, isLoading }) => {
        const handleTeamChange = useCallback(
            (teamId) => {
                onTeamChange(teamId);
            },
            [onTeamChange],
        );

        return (
            <div className="team-filter">
                <div className="team-filter__header">
                    <Text tag="h3">Фильтр по команде</Text>
                    {taskTitle && (
                        <Text
                            tag="p"
                            className="team-filter__task-title"
                            title={taskTitle}
                        >
                            Задание: {taskTitle}
                        </Text>
                    )}
                    {isLoading && (
                        <div className="team-filter__loading">
                            <ClockLoader size={16} loading={true} />
                        </div>
                    )}
                </div>
                <div className="team-filter__buttons">
                    <TeamButton
                        text="Все"
                        isActive={!currentTeam}
                        onClick={() => handleTeamChange(null)}
                        disabled={isLoading}
                    />
                    {teams.map((team) => (
                        <TeamButton
                            key={team.id}
                            text={team.name}
                            isActive={currentTeam === team.id}
                            onClick={() => handleTeamChange(team.id)}
                            disabled={isLoading}
                        />
                    ))}
                    <TeamButton
                        text="Остальные"
                        isActive={currentTeam === "other"}
                        onClick={() => handleTeamChange("other")}
                        disabled={isLoading}
                    />
                </div>
            </div>
        );
    },
);
