"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as styles from "./SearchMenu.module.scss";
import { getTeams } from "@/app/api/teamAPI";
import { getUsers } from "@/app/api/userAPI";
import Icon from "@/app/ui/icons/Icon";
import nonAvatar from "@/app/assets/img/non-avatar.png";
import UserIcon from "@/app/assets/icons/user-icon.png";
import TeamsIcon from "@/app/assets/icons/teams-icon-search.svg";

const SearchMenu = ({ onSelectTeam, onSelectUser }) => {
    const dispatch = useDispatch();
    const { teams = [] } = useSelector((state) => state.teams);
    const usersArray = useSelector((state) => state.users.users) || [];

    useEffect(() => {
        dispatch(getTeams());
        dispatch(getUsers());
    }, [dispatch]);

    return (
        <div className={styles.menuWrapper}>
            <div className={styles.cardWrapper}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.tittleIcon}>
                        <Icon src={UserIcon} alt="user-icon" />
                    </span>
                    <span className={styles.tittleInfo}>Люди</span>
                </h2>
                <div className={styles.usersContent}>
                    {usersArray.map((user) => (
                        <div
                            key={user.id}
                            className={styles.userItem}
                            onClick={() => onSelectUser(user.id)}
                        >
                            <span className={styles.avatarItem}>
                                {" "}
                                <Icon src={nonAvatar} alt="none-avatar" />
                            </span>
                            <span className={styles.userName}>
                                {user.email}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.cardWrapper}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.tittleIcon}>
                        <Icon src={TeamsIcon} alt="teams-icon" />
                    </span>
                    <span className={styles.tittleInfo}>Команды</span>
                </h2>
                <div className={styles.teamsContent}>
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            className={styles.teamItem}
                            onClick={() => onSelectTeam(team.id)}
                        >
                            {team.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.cardWrapper}>
                <h2 className={styles.sectionTitle}>Файлы</h2>
                <div className={styles.filesContent}>
                    <div className={styles.fileItem}>Файлы</div>
                </div>
            </div>

            <div className={styles.cardWrapper}>
                <h2 className={styles.sectionTitle}>Что-то еще</h2>
                <div className={styles.filesContent}>
                    <div className={styles.fileItem}>Файлы</div>
                </div>
            </div>
        </div>
    );
};

export { SearchMenu };
