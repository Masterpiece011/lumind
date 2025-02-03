"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "@/app/http/teamAPI";

const TeamsPage = ({ onSelectTeam }) => {
    const dispatch = useDispatch();
    const { teams = [], loading, error } = useSelector((state) => state.teams);

    useEffect(() => {
        dispatch(getTeams());
    }, [dispatch]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!Array.isArray(teams))
        return <div>Ошибка: данные о командах некорректны.</div>;

    return (
        <div>
            <h1>Команды</h1>
            <ul>
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <li key={team.id} onClick={() => onSelectTeam(team.id)}>
                            {team.name}
                        </li>
                    ))
                ) : (
                    <p>Нет доступных команд</p>
                )}
            </ul>
        </div>
    );
};

export { TeamsPage };
