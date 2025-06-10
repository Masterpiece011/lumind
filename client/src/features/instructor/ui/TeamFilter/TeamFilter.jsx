import React, { memo, useCallback } from "react";
import { MyButton } from "@/shared/uikit/MyButton";
import Text from "@/shared/ui/Text";
import "./TeamFilter.scss";

export const TeamButton = memo(({ text, isActive, onClick }) => {
    return (
        <MyButton
            text={text}
            onClick={onClick}
            className={isActive ? "active" : ""}
        />
    );
});

export const TeamFilter = memo(({ teams, currentTeam, onTeamChange }) => {
    const handleTeamChange = useCallback(
        (teamId) => {
            onTeamChange(teamId);
        },
        [onTeamChange],
    );

    return (
        <div className="team-filter">
            <Text tag="h3">Фильтр по команде</Text>
            <div className="team-filter__buttons">
                <TeamButton
                    text="Все"
                    isActive={!currentTeam}
                    onClick={() => handleTeamChange(null)}
                />
                {teams.map((team) => (
                    <TeamButton
                        key={team.id}
                        text={team.name}
                        isActive={currentTeam === team.id}
                        onClick={() => handleTeamChange(team.id)}
                    />
                ))}
                <TeamButton
                    text="Остальные"
                    isActive={currentTeam === "other"}
                    onClick={() => handleTeamChange("other")}
                />
            </div>
        </div>
    );
});
