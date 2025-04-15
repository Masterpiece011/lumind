"use client";

import React, { useEffect, memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MyButton } from "@/shared/uikit/MyButton";
import { Icon } from "../../../../shared/uikit/icons";
import Arrow from "@/app/assets/icons/arrow-icon.svg";

import "./style.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import { getTeams } from "@/shared/api/teamAPI";

const TeamsPage = memo(({ onSelectTeam }) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    const {
        teams = [],
        loading,
        error,
    } = useSelector(
        (state) => state.teams,
        (prev, next) =>
            prev.teams === next.teams &&
            prev.loading === next.loading &&
            prev.error === next.error,
    );

    useEffect(() => {
        dispatch(getTeams());
    }, [dispatch]);

    const toggleAccordion = () => {
        setIsExpanded(!isExpanded);
    };

    if (loading) return <div className="teams__loading">Загрузка...</div>;
    if (error) return <div className="teams__error">Ошибка: {error}</div>;
    if (!Array.isArray(teams))
        return (
            <div className="teams__error">
                Ошибка: данные о командах некорректны.
            </div>
        );

    return (
        <div className="teams">
            <div className="teams__header">
                <MyButton
                    className={`${buttonStyles.accordionButton} ${isExpanded ? "teams__button--active" : ""}`}
                    onClick={toggleAccordion}
                >
                    <div className={buttonStyles.accordionInfo}>
                        <p className={buttonStyles.accordionTittle}>Захлушка</p>
                        <Icon
                            src={Arrow}
                            alt="arrow"
                            className={`teams__arrow ${isExpanded ? "teams__arrow--expanded" : ""}`}
                        />
                    </div>
                </MyButton>
            </div>
            <div className="teams__divider"></div>
            <div
                className={`teams__content ${isExpanded ? "teams__content--expanded" : "teams__content--collapsed"}`}
            >
                <ul className="teams__list">
                    {teams.length > 0 ? (
                        teams.map((team) => (
                            <li
                                className="teams__item"
                                key={team.id}
                                onClick={() => onSelectTeam(team.id)}
                            >
                                <div
                                    className="teams__avatar"
                                    style={{
                                        backgroundColor: team.avatar_color,
                                    }}
                                ></div>
                                <div className="teams__info">
                                    <h3 className="teams__name">{team.name}</h3>
                                    <div className="teams__info-divider"></div>
                                    {team.groups && team.groups.length > 0 ? (
                                        <ul className="teams__groups">
                                            {team.groups.map((group) => (
                                                <li
                                                    key={group.id}
                                                    className="teams__group"
                                                >
                                                    {group.title}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="teams__empty">
                                            Список групп Пуст
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="teams__empty">Нет доступных команд</p>
                    )}
                </ul>
            </div>
        </div>
    );
});

export { TeamsPage };
