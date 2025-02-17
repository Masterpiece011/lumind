"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "@/app/api/teamAPI";
import { MyButton } from "../../uikit";
import Icon from "@/app/ui/icons/Icon";
import Arrow from "@/app/assets/icons/arrow-icon.svg";

import "./TeamsComp.scss";
import * as buttonStyles from "@/app/components/uikit/MyButton/MyButton.module.scss";

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
