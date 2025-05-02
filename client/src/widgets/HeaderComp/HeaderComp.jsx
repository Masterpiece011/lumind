"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@/features/theme/model/useTheme";
import { useUserModal } from "@/shared/lib/hooks/useUserModal";

import Settings from "@/shared/assets/icons/settings.svg";
import SearchIcon from "@/shared/assets/icons/search-icon.svg";
import MoonIcon from "@/shared/assets/icons/theme-icon.svg";
import SunIcon from "@/shared/assets/icons/theme-icon-2.svg";
import ProfileIcon from "@/shared/assets/icons/user-profile.svg";

import "./HeaderComp.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

import { Icon } from "@/shared/uikit/icons";
import { MyButton } from "@/shared/uikit/MyButton";
import { getUsers } from "@/shared/api/userAPI";
import { getTeams } from "@/shared/api/teamAPI";
import { logout } from "@/entities/user/model/userStore";
import Logo from "@/app/assets/img/logo.svg";
import Logout from "@/app/assets/icons/logout-icon.svg";

function HeaderComp({ onSearchFocus, onSearchChange }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuth, user } = useSelector((state) => state.user);
    const { showUserModal } = useUserModal();
    const searchInputRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (isAuth && user?.id) {
            dispatch(getUsers({ page: 1, quantity: 100 }));
            dispatch(getTeams({ userId: user.id }));
        }
    }, [dispatch, isAuth, user?.id]);

    const handleProfileClick = () => {
        if (user) {
            showUserModal(user);
        }
    };

    const handleLoginClick = () => {
        router.push("/login");
    };

    const handleLogoutClick = () => {
        dispatch(logout());
        window.history.replaceState(null, "", "/login");
        router.replace("/login");
    };

    const handleSearchChange = (e) => {
        const value = e.target.value.trim();
        setSearchQuery(value);
        onSearchChange(value);
    };

    const handleSearchFocus = () => {
        onSearchFocus(searchQuery);
    };

    return (
        <header>
            <div className="header">
                <div className="header__wrapper">
                    <div className="header__logo-wrapper">
                        <a href="/">
                            <Icon src={Logo} alt="logo" />
                        </a>
                    </div>
                    {isAuth && (
                        <div className="header__search">
                            <div className="header__search-bar">
                                <Icon
                                    className="header__search-icon"
                                    src={SearchIcon}
                                    alt="search"
                                />
                                <input
                                    ref={searchInputRef}
                                    className="header__search-input"
                                    type="search"
                                    placeholder="Введите имя пользователя или название сообщества..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={handleSearchFocus}
                                />
                            </div>
                        </div>
                    )}
                    <div className="header__content">
                        <div className="header__content-wrapper">
                            <MyButton
                                className={buttonStyles.headerButton}
                                onClick={handleProfileClick}
                            >
                                <Icon src={ProfileIcon} alt="profile-icon" />
                            </MyButton>

                            <MyButton
                                className={buttonStyles.headerButton}
                                onClick={toggleTheme}
                            >
                                <Icon
                                    src={theme === "dark" ? SunIcon : MoonIcon}
                                    alt={
                                        theme === "dark"
                                            ? "dark-theme-icon"
                                            : "light-theme-icon"
                                    }
                                />
                            </MyButton>

                            <MyButton className={buttonStyles.headerButton}>
                                <Icon src={Settings} alt="settings-icon" />
                            </MyButton>

                            {isAuth ? (
                                <MyButton
                                    className={buttonStyles.headerButton}
                                    onClick={handleLogoutClick}
                                >
                                    <Icon src={Logout} alt="logout-icon" />
                                </MyButton>
                            ) : (
                                <MyButton
                                    className={buttonStyles.headerButton}
                                    onClick={handleLoginClick}
                                >
                                    <Icon src={Logout} alt="logout-icon" />
                                </MyButton>
                            )}
                        </div>
                    </div>
                </div>
                <div className="header__divider"></div>
            </div>
        </header>
    );
}

export { HeaderComp };
