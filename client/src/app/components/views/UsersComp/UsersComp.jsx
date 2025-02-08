"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUsers } from "@/app/api/userAPI";
import * as styles from "./UsersComp.module.scss";
import { MyButton } from "../../uikit";

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
        <div className={styles.usersWrapper}>
            <div className={styles.filters}>
                <MyButton onClick={() => setFilter("all")} text="Все" />

                <MyButton
                    onClick={() => setFilter("instructors")}
                    text="Преподаватели"
                />

                <MyButton onClick={() => setFilter("users")} text="Группа" />

                <MyButton onClick={() => setFilter("teams")} text="Команды" />
            </div>
            <div className={styles.usersList}>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className={styles.userItem}>
                            <p>
                                {user.email} ({user.role.name})
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Пользователей не найдено</p>
                )}
            </div>
        </div>
    );
};

export { UsersPage };
