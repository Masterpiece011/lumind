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
import { UserModal } from "../Profile";
import { FileItem } from "../../FileComp";
import { getUserSubmissions } from "@/app/api/submissionAPI";

const SearchMenu = ({ onSelectTeam }) => {
    const dispatch = useDispatch();
    const { teams = [] } = useSelector((state) => state.teams);
    const usersArray = useSelector((state) => state.users.users) || [];
    const { submissions: submissionsData = [] } = useSelector(
        (state) => state.submissions,
    );
    const user_id = useSelector((state) => state.user.user?.id);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userFiles, setUserFiles] = useState([]);

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

    return (
        <div className="search-menu">
            <div className="search-menu__card">
                <h2 className="search-menu__section-title">
                    <span className="search-menu__title-icon">
                        <Icon src={UserIcon} alt="user-icon" />
                    </span>
                    <span className="search-menu__title-text">Люди</span>
                </h2>

                <div className="search-menu__users-content">
                    {usersArray.map((user) => (
                        <div
                            key={user.id}
                            className="search-menu__user-item"
                            onClick={() => setSelectedUser(user)}
                        >
                            <span className="search-menu__avatar">
                                <Icon src={nonAvatar} alt="none-avatar" />
                            </span>
                            <span className="search-menu__user-name">
                                {user.email}
                            </span>
                        </div>
                    ))}
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
                    {userFiles.length > 0 ? (
                        userFiles.map((file) => (
                            <FileItem
                                key={file.id}
                                fileUrl={file.file_url}
                                compact
                            />
                        ))
                    ) : (
                        <p className="search-menu__empty-message">
                            Нет последних файлов
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
                    {teams.map((team) => (
                        <li
                            className="teams-content__list"
                            key={team.id}
                            onClick={() => onSelectTeam(team.id)}
                        >
                            <div
                                className="list__avatar"
                                style={{ backgroundColor: team.avatar_color }}
                            ></div>
                            <div className="list__info">
                                <div className="info__divider"></div>
                                <h3 className="info__name">{team.name}</h3>
                            </div>
                        </li>
                    ))}
                </div>
            </div>

            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export { SearchMenu };
