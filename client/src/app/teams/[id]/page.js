"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeamById } from "@/app/api/teamAPI";
import "../TeamDetail.scss";
import * as buttonStyles from "@/app/components/uikit/MyButton/MyButton.module.scss";
import { MyButton } from "@/app/components/uikit";
import { Icon } from "@/app/components/ui/icons";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignment from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";

import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/app/api/assignmentsAPI";

const TeamDetailPage = ({ onSelectAssignment }) => {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const { currentTeam, loading, error } = useSelector((state) => state.teams);
    const user_id = useSelector((state) => state.user.user?.id);
    const { assignments = [] } = useSelector((state) => state.assignments);

    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        if (id && user_id) {
            dispatch(getTeamById({ teamId: id, userId: user_id }));
        }
    }, [id, user_id, dispatch]);

    useEffect(() => {
        if (activeTab === "assignments" && currentTeam && user_id) {
            dispatch(getAssignments({ userId: user_id, filter: "all" }));
        }
    }, [activeTab, currentTeam, user_id, dispatch]);

    const handleSidebarClick = (path) => {
        router.push(path);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!currentTeam) return <div>Команда не найдена</div>;

    const tabContent = {
        posts: <p>Публикации команды (заглушка)</p>,
        members: (
            <ul>
                {currentTeam.users && currentTeam.users.length > 0 ? (
                    currentTeam.users.map((user) => (
                        <li key={user.id}>
                            {user.first_name} {user.last_name} ({user.email})
                        </li>
                    ))
                ) : (
                    <p>Нет участников</p>
                )}
            </ul>
        ),
        assignments: (
            <div>
                <h3>Задания</h3>
                <div className="assignments__card-wrapper">
                    {assignments.length > 0 ? (
                        assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="assignments__card"
                                onClick={() =>
                                    onSelectAssignment(assignment.id)
                                }
                            >
                                <div className="assignments__header">
                                    <span className="assignments__date">
                                        {new Date(
                                            assignment.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="assignments__name">
                                    {assignment.title}
                                </h2>
                                <div className="assignments__deadline">
                                    Срок:{" "}
                                    {new Date(
                                        assignment.due_date,
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="assignments__empty"></p>
                    )}
                </div>
            </div>
        ),
        groups: (
            <ul>
                {currentTeam.groups && currentTeam.groups.length > 0 ? (
                    currentTeam.groups.map((group) => (
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
                    ))
                ) : (
                    <p>Нет групп</p>
                )}
            </ul>
        ),
    };

    return (
        <div className="team__wrapper">
            <div className="team__content-wrapper">
                <div className="team__content">
                    {tabContent[activeTab] || <p>Выберите раздел</p>}
                </div>
            </div>
            <aside className="team__sidebar">
                <div
                    className="team__avatar"
                    style={{ backgroundColor: currentTeam.avatar_color }}
                ></div>
                <div className="team__divider"></div>
                <h2>{currentTeam.name}</h2>
                <ul className="team__sidebar-content">
                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("members")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={UserIcon} alt="user-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>
                            Участники
                        </span>
                    </MyButton>

                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("assignments")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={Assignment} alt="assignment-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>
                            Задания
                        </span>
                    </MyButton>

                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("groups")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={File} alt="file-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>Файлы</span>
                    </MyButton>

                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("posts")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={Publication} alt="publication-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>
                            Публикации
                        </span>
                    </MyButton>
                </ul>
            </aside>
        </div>
    );
};

export default TeamDetailPage;
