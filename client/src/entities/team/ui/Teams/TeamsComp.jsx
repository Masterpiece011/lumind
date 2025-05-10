"use client";

import React, { useEffect, memo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MyButton } from "@/shared/uikit/MyButton";
import { Icon } from "@/shared/uikit/icons";
import Arrow from "@/app/assets/icons/arrow-icon.svg";

import "./TeamsComp.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

import { getTeams } from "@/shared/api/teamAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

const TeamsPage = memo(({ userId, onSelectTeam }) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    const initialRender = useRef(true);
    const lastUserId = useRef(null);

    const userRole = useSelector((state) => state.user.user?.role?.name);
    const isInstructor = userRole === "INSTRUCTOR";

    const {
        teams = [],
        teamsTotal = 0,
        loading,
        error,
    } = useSelector((state) => ({
        teams: state.teams.teams,
        teamsTotal: state.teams.teamsTotal,
        loading: state.teams.loading,
        error: state.teams.error,
    }));

    useEffect(() => {
        if (initialRender.current || userId === lastUserId.current) {
            initialRender.current = false;
            return;
        }

        if (userId) {
            console.log("Fetching teams for userId:", userId);
            lastUserId.current = userId;
            dispatch(
                getTeams({
                    userId: isInstructor ? null : userId, // Для преподавателя получаем все команды
                    ...(isInstructor && { instructor_id: userId }), // Для преподавателя - только где он создатель
                }),
            );
        }
    }, [userId, dispatch, isInstructor]);

    const toggleAccordion = () => {
        setIsExpanded(!isExpanded);
    };

    if (loading && !initialRender.current)
        return <ClockLoader loading={loading} />;
    if (error) return <div className="teams__error">Ошибка: {error}</div>;
    if (!Array.isArray(teams)) {
        return (
            <div className="teams__error">
                Ошибка: данные о командах некорректны.
            </div>
        );
    }

    return (
        <div className="teams">
            <div className="teams__header">
                <MyButton
                    className={`${buttonStyles.accordionButton} ${isExpanded ? "teams__button--active" : ""}`}
                    onClick={toggleAccordion}
                >
                    <div className={buttonStyles.accordionInfo}>
                        <p className={buttonStyles.accordionTittle}>
                            {isInstructor ? "Мои команды" : "Команды"}
                        </p>
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
                    {teamsTotal > 0 ? (
                        teams.map((team) => (
                            <li
                                className="teams__item"
                                key={team.id}
                                onClick={() => onSelectTeam(team.id)}
                            >
                                <div
                                    className="teams__avatar"
                                    style={{
                                        backgroundColor:
                                            team.avatar_color || "#ccc",
                                    }}
                                ></div>
                                <div className="teams__info">
                                    <h3 className="teams__name">{team.name}</h3>
                                    <div className="teams__info-divider"></div>
                                    {team.description && (
                                        <p className="teams__info-description">
                                            {team.description}
                                        </p>
                                    )}
                                    {isInstructor && (
                                        <p className="teams__members-count">
                                            Участников: {team.users_count || 0}
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
