"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUsers } from "@/shared/api/userAPI";

import "./UsersComp.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";
import { MyButton } from "@/shared/uikit/MyButton";
import { formatUserName } from "@/shared/lib/utils/formatUserName";
import { getTranslatedRole } from "@/shared/lib/utils/getTranslatedRole";

const UsersPage = () => {
    const dispatch = useDispatch();
    const usersArray = useSelector((state) => state.users.users) || [];

    const [filter, setFilter] = useState("all");

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const filteredUsers = usersArray.filter((user) => {
        if (user.role.name === "ADMIN" || user.role.name === "MODERATOR") {
            return false;
        }

        if (filter === "instructors") return user.role.name === "INSTRUCTOR";
        if (filter === "users") return user.role.name === "USER";

        return true;
    });

    return (
        <div className="users">
            <div className="users__filters">
                <MyButton
                    onClick={() => setFilter("all")}
                    text="Все"
                    className={buttonStyles.users__filterBtn}
                />

                <MyButton
                    onClick={() => setFilter("instructors")}
                    text="Преподаватели"
                    className={buttonStyles.users__filterBtn}
                />

                <MyButton
                    onClick={() => setFilter("users")}
                    text="Группа"
                    className={buttonStyles.users__filterBtn}
                />

                <MyButton
                    onClick={() => setFilter("teams")}
                    text="Команды"
                    className={buttonStyles.users__filterBtn}
                />
            </div>
            <div className="users__list">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="users__item">
                            <p className="users__text">
                                {formatUserName(user)}{" "}
                                {getTranslatedRole(user.role)}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="users__empty">Пользователей не найдено</p>
                )}
            </div>
        </div>
    );
};

export { UsersPage };
