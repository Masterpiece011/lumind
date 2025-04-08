"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SearchMenu.scss";
import { getTeams } from "@/app/api/teamAPI";
import { getUsers } from "@/app/api/userAPI";
import { Icon } from "../../ui/icons";
import nonAvatar from "@/app/assets/img/non-avatar.png";
import UserIcon from "@/app/assets/icons/user-icon.png";
import TeamsIcon from "@/app/assets/icons/teams-icon-search.svg";
import FilesIcon from "@/app/assets/icons/file-icon.svg";
import { FileItem } from "../../FileComp";
import { getUserSubmissions } from "@/app/api/submissionAPI";
import { useUserModal } from "@/app/hooks/useUserModal";

const SearchMenu = ({ onSelectTeam, searchQuery = "", menuRef }) => {
    const dispatch = useDispatch();
    const { teams = [] } = useSelector((state) => state.teams);
    const usersArray = useSelector((state) => state.users.users) || [];
    const { submissions: submissionsData = [] } = useSelector(
        (state) => state.submissions,
    );
    const user_id = useSelector((state) => state.user.user?.id);

    const [userFiles, setUserFiles] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const { showUserModal } = useUserModal();

    const handleUserClick = (user, e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        showUserModal(user);
    };

    useEffect(() => {
        if (!teams.length) dispatch(getTeams());
        if (!usersArray.length) dispatch(getUsers());
        if (user_id) dispatch(getUserSubmissions(user_id));
    }, [dispatch, teams.length, usersArray.length, user_id]);

    useEffect(() => {
        if (Array.isArray(submissionsData)) {
            const uniqueFiles = new Map();

            submissionsData.forEach((submission) => {
                (submission.submissions_investments || []).forEach((file) => {
                    if (!uniqueFiles.has(file.file_url)) {
                        uniqueFiles.set(file.file_url, {
                            ...file,
                            submissionDate: submission.created_at,
                            assignmentTitle:
                                submission.Assignment?.title ||
                                "Неизвестное задание",
                        });
                    }
                });
            });

            const recentFiles = Array.from(uniqueFiles.values())
                .sort(
                    (a, b) =>
                        new Date(b.submissionDate) - new Date(a.submissionDate),
                )
                .slice(0, 8);

            setUserFiles(recentFiles);
        }
    }, [submissionsData]);

    useEffect(() => {
        const query = searchQuery.toLowerCase();

        setFilteredUsers(
            usersArray.filter(
                (user) =>
                    user.email.toLowerCase().includes(query) ||
                    user.name?.toLowerCase().includes(query),
            ),
        );

        setFilteredTeams(
            teams.filter(
                (team) =>
                    team.name.toLowerCase().includes(query) ||
                    team.description?.toLowerCase().includes(query),
            ),
        );

        setFilteredFiles(
            userFiles.filter(
                (file) =>
                    file.file_url.toLowerCase().includes(query) ||
                    file.assignmentTitle?.toLowerCase().includes(query),
            ),
        );
    }, [searchQuery, usersArray, teams, userFiles]);

    return (
        <div
            className="search-menu"
            ref={menuRef}
            onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
            }}
        >
            <div className="search-menu__card">
                <h2 className="search-menu__section-title">
                    <span className="search-menu__title-icon">
                        <Icon src={UserIcon} alt="user-icon" />
                    </span>
                    <span className="search-menu__title-text">Люди</span>
                </h2>

                <div className="search-menu__users-content">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="search-menu__user-item"
                                onClick={(e) => handleUserClick(user, e)}
                            >
                                <span className="search-menu__avatar">
                                    <Icon src={nonAvatar} alt="none-avatar" />
                                </span>
                                <span className="search-menu__user-name">
                                    {user.email}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="search-menu__empty-message">
                            {searchQuery
                                ? "Нет результатов"
                                : "Нет пользователей"}
                        </p>
                    )}
                </div>
            </div>

            <div className="search-menu__card">
                <h2 className="search-menu__section-title">
                    <span className="search-menu__title-icon">
                        <Icon src={FilesIcon} alt="files-icon" />
                    </span>
                    <span className="search-menu__title-text">Файлы</span>
                </h2>
                <div className="search-menu__files-list">
                    {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                            <FileItem
                                key={file.id}
                                fileUrl={file.file_url}
                                compact
                            />
                        ))
                    ) : (
                        <p className="search-menu__empty-message">
                            {searchQuery ? "Нет результатов" : "Нет файлов"}
                        </p>
                    )}
                </div>
            </div>

            <div className="search-menu__card-team">
                <h2 className="search-menu__section-title">
                    <span className="search-menu__title-icon">
                        <Icon src={TeamsIcon} alt="teams-icon" />
                    </span>
                    <span className="search-menu__title-text">Команды</span>
                </h2>
                <div className="search-menu__teams-content">
                    {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                            <li
                                className="teams-content__list"
                                key={team.id}
                                onClick={() => onSelectTeam(team.id)}
                            >
                                <div
                                    className="list__avatar"
                                    style={{
                                        backgroundColor: team.avatar_color,
                                    }}
                                ></div>
                                <div className="list__info">
                                    <div className="info__divider"></div>
                                    <h3 className="info__name">{team.name}</h3>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="search-menu__empty-message">
                            {searchQuery ? "Нет результатов" : "Нет команд"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export { SearchMenu };
