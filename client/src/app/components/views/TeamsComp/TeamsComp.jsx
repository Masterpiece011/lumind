"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "@/app/api/teamAPI";
import { MyButton } from "../../uikit";
import Icon from "@/app/ui/icons/Icon";
import Arrow from "@/app/assets/icons/arrow-icon.svg";

import "./TeamsComp.scss";
import * as buttonStyles from "@/app/components/uikit/MyButton/MyButton.module.scss";

const COLORS = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3C623",
    "#A233FF",
    "#FF33A8",
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const TeamsPage = ({ onSelectTeam }) => {
    const dispatch = useDispatch();
    const { teams = [], loading, error } = useSelector((state) => state.teams);
    const [teamColors, setTeamColors] = useState({});

    useEffect(() => {
        dispatch(getTeams());
    }, [dispatch]);

    useEffect(() => {
        if (teams.length > 0) {
            const colors = {};
            teams.forEach((team) => {
                colors[team.id] = getRandomColor();
            });
            setTeamColors(colors);
        }
    }, [teams]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!Array.isArray(teams))
        return <div>Ошибка: данные о командах некорректны.</div>;

    return (
        <div className="teamsWrapper">
            <div className="teamsDetails">
                <MyButton className={buttonStyles.teamsButton}>
                    <div className={buttonStyles.tittleInfo}>
                        <p className={buttonStyles.teamTittle}>Захлушка</p>
                        <Icon src={Arrow} alt="arrow" />
                    </div>
                </MyButton>
            </div>
            <div className="teamDivider"></div>
            <ul className="teamList">
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <li
                            className="teamCard"
                            key={team.id}
                            onClick={() => onSelectTeam(team.id)}
                        >
                            <div
                                className="teamAvatar"
                                style={{ backgroundColor: teamColors[team.id] }}
                            ></div>
                            <div className="teamInfo">
                                <h3 className="teamName">{team.name}</h3>
                                <div className="infoDivider"></div>
                                {team.groups && team.groups.length > 0 ? (
                                    <ul className="groupList">
                                        {team.groups.map((group) => (
                                            <li
                                                key={group.id}
                                                className="groupItem"
                                            >
                                                {group.title}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="noGroups">
                                        Список групп Пуст
                                    </p>
                                )}
                            </div>
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
