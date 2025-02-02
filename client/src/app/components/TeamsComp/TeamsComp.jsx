"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "@/app/http/teamAPI";
import Link from "next/link";

const TeamsPage = () => {
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
                        <li key={team.id}>
                            <Link href={`/teams/${team.id}`}>{team.name}</Link>
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
