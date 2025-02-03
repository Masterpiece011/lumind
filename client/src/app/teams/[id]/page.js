"use client";

import React, { useEffect, useState } from "react";
import { getTeamById } from "@/app/http/teamAPI";

const TeamDetailPage = ({ id }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await getTeamById(id);
                setTeam(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTeam();
        }
    }, [id]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!team) return <div>Команда не найдена</div>;

    return (
        <div>
            <h1>{team.name}</h1>
            <p>{team.description || "Описание отсутствует"}</p>
            <p>
                Создана:{" "}
                {team.created_at
                    ? new Date(team.created_at).toLocaleDateString()
                    : "Дата неизвестна"}
            </p>

            <h2>Участники:</h2>
            {team.users && team.users.length > 0 ? (
                <ul>
                    {team.users.map((user) => (
                        <li key={user.id}>
                            {user.first_name} {user.middle_name}{" "}
                            {user.last_name} ({user.email})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Нет участников</p>
            )}

            <h2>Группы:</h2>
            {team.groups && team.groups.length > 0 ? (
                <ul>
                    {team.groups.map((group) => (
                        <li key={group.id}>
                            {group.title} ({group.users.length} участников)
                            <ul>
                                {group.users.map((user) => (
                                    <li key={user.id}>
                                        {user.first_name} {user.last_name} (
                                        {user.email})
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Нет групп</p>
            )}
        </div>
    );
};

export default TeamDetailPage;
