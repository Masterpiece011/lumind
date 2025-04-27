"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SearchMenu.scss";
import { getTeams } from "@/shared/api/teamAPI";
import { getUsers } from "@/shared/api/userAPI";

import { Icon } from "@/shared/uikit/icons";
import nonAvatar from "@/app/assets/img/non-avatar.png";
import UserIcon from "@/app/assets/icons/user-icon.png";
import TeamsIcon from "@/app/assets/icons/teams-icon-search.svg";
import FilesIcon from "@/app/assets/icons/file-icon.svg";

import { FileItem } from "@/shared/ui/FileComp";
import { getUserSubmissions } from "@/shared/api/submissionAPI";
import { useUserModal } from "@/shared/lib/hooks/useUserModal";
import { useSearchFilter } from "@/shared/lib/hooks/useSearchFilter";
import { formatUserName } from "@/shared/lib/utils/formatUserName";
import { useUserFiles } from "@/shared/lib/hooks/useUserFiles";

const SearchMenu = ({
    onSelectTeam,
    searchQuery = "",
    menuRef,
    onTeamsCardClick,
    onUsersCardClick,
}) => {
    const dispatch = useDispatch();
    const { teams = [] } = useSelector((state) => state.teams);
    const usersArray = useSelector((state) => state.users.users) || [];

    const user_id = useSelector((state) => state.user.user?.id);

    const userFiles = useUserFiles(user_id);
    const { showUserModal } = useUserModal();

    const { filteredUsers, filteredTeams, filteredFiles } = useSearchFilter(
        searchQuery,
        usersArray,
        teams,
        userFiles,
    );

    const handleUserClick = (user, e) => {
        e.preventDefault();
        e.stopPropagation();
        showUserModal(user);
    };

    useEffect(() => {
        if (user_id) {
            if (!teams.length) dispatch(getTeams({ userId: user_id }));
            if (!usersArray.length)
                dispatch(getUsers({ page: 1, quantity: 100 }));
            dispatch(getUserSubmissions(user_id));
        }
    }, [dispatch, teams.length, usersArray.length, user_id]);

    return (
        <div
            className="search-menu"
            ref={menuRef}
            onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
            }}
        >
            <div
                className="search-menu__card"
                onClick={(e) => {
                    e.stopPropagation();
                    onUsersCardClick();
                }}
            >
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
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <span className="search-menu__avatar">
                                    <Icon src={nonAvatar} alt="none-avatar" />
                                </span>
                                <span className="search-menu__user-name">
                                    {formatUserName(user)}
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

            <div
                className="search-menu__card-team"
                onClick={(e) => {
                    e.stopPropagation();
                    onTeamsCardClick();
                }}
            >
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
