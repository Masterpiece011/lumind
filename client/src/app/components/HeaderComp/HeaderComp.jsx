"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Settings from "@/app/assets/icons/settings.svg";
import SearchIcon from "@/app/assets/icons/search-icon.svg";
import * as styles from "./HeaderComp.module.scss";
import * as buttonStyles from "../uikit/MyButton/MyButton.module.scss";
import { MyButton } from "../uikit";
import { getUsers } from "@/app/api/userAPI";
import { getTeams } from "@/app/api/teamAPI";
import { logout } from "@/app/store/userStore";
import Logo from "@/app/assets/img/logo.svg";
import Logout from "@/app/assets/icons/logout-icon.svg";

function HeaderComp({ onSelectSearch }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuth } = useSelector((state) => state.user);
    const usersArray = useSelector((state) => state.users.users) || [];
    const teamsArray = useSelector((state) => state.teams.teams) || [];

    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        dispatch(getUsers());
        dispatch(getTeams());
    }, [dispatch]);

    const handleLoginClick = () => {
        router.push("/login");
    };

    const handleLogoutClick = () => {
        dispatch(logout());
        router.push("/");
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchClick = () => {
        setShowDropdown(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };

    const filteredResults = [...usersArray, ...teamsArray].filter(
        (item) =>
            item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className={styles.header}>
            <div className={styles.headerWrapper}>
                <div className={styles.logoWrapper}>
                    <Image src={Logo} alt="logo" />
                </div>
                {isAuth && (
                    <div className={styles.searchBar}>
                        <Image src={SearchIcon} alt="search" />
                        <input
                            type="search"
                            placeholder="Введите имя пользователя или название сообщества..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onClick={handleSearchClick}
                            onBlur={handleBlur}
                        />
                        {showDropdown && searchQuery && (
                            <div className={styles.searchDropdown}>
                                <p className={styles.dropdownTitle}></p>
                                {filteredResults.length > 0 ? (
                                    <>
                                        {filteredResults.map((item, index) => (
                                            <div
                                                key={`${item.id}-${index}`}
                                                className={styles.userItem}
                                            >
                                                {item.email || item.name}{" "}
                                            </div>
                                        ))}
                                        <MyButton
                                            onClick={onSelectSearch}
                                            text="Подробнее"
                                        />
                                    </>
                                ) : (
                                    <p className={styles.noUsers}>
                                        Ничего не найдено
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className={styles.contentWrapper}>
                    <div className={styles.settingsWrapper}>
                        <Image src={Settings} alt="settings-icon" />
                    </div>
                    {isAuth ? (
                        <MyButton
                            className={buttonStyles.headerButton}
                            onClick={handleLogoutClick}
                        >
                            <Image src={Logout} alt="logout-icon" />
                        </MyButton>
                    ) : (
                        <MyButton
                            className={buttonStyles.headerButton}
                            onClick={handleLoginClick}
                        >
                            <Image src={Logout} alt="logout-icon" />
                        </MyButton>
                    )}
                </div>
            </div>
            <div className={styles.divider}></div>
        </div>
    );
}

export { HeaderComp };
