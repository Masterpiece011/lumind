"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeamById } from "@/app/api/teamAPI";
import * as styles from "@/app/teams/team.module.scss";
import * as buttonStyles from "@/app/components/uikit/MyButton/MyButton.module.scss";
import { MyButton } from "@/app/components/uikit";
import { Icon } from "@/app/components/ui/icons";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignment from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";

import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/app/api/assignmentsAPI";

const TeamDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const { assignments = [] } = useSelector((state) => state.assignments);

    useEffect(() => {
        if (!id) return;
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
        fetchTeam();
    }, [id]);

    useEffect(() => {
        if (activeTab === "assignments" && team) {
            dispatch(getAssignments(team.id));
        }
    }, [activeTab, team, dispatch]);

    const handleSidebarClick = (path) => {
        router.push(path);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!team) return <div>Команда не найдена</div>;

    const tabContent = {
        posts: <p>Публикации команды (заглушка)</p>,
        members: (
            <ul>
                {team.users && team.users.length > 0 ? (
                    team.users.map((user) => (
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
                <ul>
                    {assignments && assignments.length > 0 ? (
                        assignments.map((assignment) => (
                            <li
                                key={assignment.id}
                                onClick={() =>
                                    handleSidebarClick(
                                        `/assignments/${assignment.id}`,
                                    )
                                }
                            >
                                {assignment.title}
                            </li>
                        ))
                    ) : (
                        <p>Нет заданий</p>
                    )}
                </ul>
            </div>
        ),
        groups: (
            <ul>
                {team.groups && team.groups.length > 0 ? (
                    team.groups.map((group) => (
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
        <div className={styles.teamWrapper}>
            <div className={styles.contentWrapper}>
                <div className={styles.teamContent}>
                    {tabContent[activeTab] || <p>Выберите раздел</p>}
                </div>
            </div>
            <aside className={styles.teamSidebar}>
                <div className={styles.dividerSidebar}></div>
                <h2>{team.name}</h2>
                <ul>
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
