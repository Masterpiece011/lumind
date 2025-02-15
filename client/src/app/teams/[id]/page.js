"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTeamById } from "@/app/api/teamAPI";
import * as styles from "@/app/teams/team.module.scss";
import { MyButton } from "@/app/components/uikit";
import Icon from "@/app/ui/icons/Icon";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignments from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";

const TeamDetailPage = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");

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
                    <MyButton onClick={() => setActiveTab("members")}>
                        <span className={styles.buttonIcon}>
                            <Icon src={UserIcon} alt="user-icon" />
                        </span>
                        <span className={styles.buttonInfo}>Участники</span>
                    </MyButton>

                    <MyButton onClick={() => setActiveTab("assignments")}>
                        <span className={styles.buttonIcon}>
                            <Icon src={Assignments} alt="assignment-icon" />
                        </span>
                        <span className={styles.buttonInfo}>Задания</span>
                    </MyButton>

                    <MyButton onClick={() => setActiveTab("groups")}>
                        <span className={styles.buttonIcon}>
                            <Icon src={File} alt="file-icon" />
                        </span>
                        <span className={styles.buttonInfo}>Файлы</span>
                    </MyButton>

                    <MyButton onClick={() => setActiveTab("posts")}>
                        <span className={styles.buttonIcon}>
                            <Icon src={Publication} alt="publication-icon" />
                        </span>
                        <span className={styles.buttonInfo}>Публикации</span>
                    </MyButton>
                </ul>
            </aside>
        </div>
    );
};

export default TeamDetailPage;
