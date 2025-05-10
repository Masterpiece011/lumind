"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatUserName } from "@/shared/lib/utils/formatUserName";
import { getTranslatedRole } from "@/shared/lib/utils/getTranslatedRole";
import { useUserModal } from "@/shared/lib/hooks/useUserModal";
import { useFilteredUsers } from "@/entities/user/model/useFilteredUsers";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { Icon } from "@/shared/uikit/icons";
import nonAvatar from "@/shared/assets/icons/user-profile.svg";

import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import "./UsersComp.scss";
import { MyButton } from "@/shared/uikit/MyButton";

const UsersPage = () => {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("q") || "";
    const { showUserModal } = useUserModal();
    const [filter, setFilter] = useState("all");

    const { filteredUsers, isLoading } = useFilteredUsers(filter, searchQuery);

    const handleUserClick = (user) => {
        showUserModal(user);
    };

    if (isLoading) return;
    <ClockLoader className="users__loading" />;

    return (
        <div className="users">
            <div className="users__filters">
                <MyButton
                    onClick={() => setFilter("all")}
                    text="Все"
                    className={`${buttonStyles.users__filterBtn} ${
                        filter === "all" ? buttonStyles.active : ""
                    }`}
                />

                <MyButton
                    onClick={() => setFilter("instructors")}
                    text="Преподаватели"
                    className={`${buttonStyles.users__filterBtn} ${
                        filter === "instructors" ? buttonStyles.active : ""
                    }`}
                />

                <MyButton
                    onClick={() => setFilter("users")}
                    text="Студенты"
                    className={`${buttonStyles.users__filterBtn} ${
                        filter === "users" ? buttonStyles.active : ""
                    }`}
                />

                <MyButton
                    onClick={() => setFilter("teams")}
                    text="Группа"
                    className={`${buttonStyles.users__filterBtn} ${
                        filter === "teams" ? buttonStyles.active : ""
                    }`}
                />
            </div>
            <div className="users__list">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="users__item"
                            onClick={() => handleUserClick(user)}
                        >
                            <div className="users__avatar">
                                <Icon src={nonAvatar} alt="avatar" />
                            </div>
                            <div className="users__info">
                                <p className="users__name">
                                    {formatUserName(user)}
                                </p>
                                <p className="users__role">
                                    {getTranslatedRole(user.role)}
                                </p>
                                <p className="users__email">{user.email}</p>
                                {user.group?.title && (
                                    <p className="users__group">
                                        {user.group.title}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="users__empty">
                        {searchQuery
                            ? "Ничего не найдено"
                            : filter === "users"
                              ? "Студентов не найдено"
                              : filter === "instructors"
                                ? "Преподавателей не найдено"
                                : "Пользователей не найдено"}
                    </p>
                )}
            </div>
        </div>
    );
};

export { UsersPage };
