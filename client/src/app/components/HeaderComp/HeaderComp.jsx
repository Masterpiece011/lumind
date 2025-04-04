"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Settings from "@/app/assets/icons/settings.svg";
import SearchIcon from "@/app/assets/icons/search-icon.svg";
import "./HeaderComp.scss";
import * as buttonStyles from "../uikit/MyButton/MyButton.module.scss";
import { MyButton } from "../uikit";
import { getUsers } from "@/app/api/userAPI";
import { getTeams } from "@/app/api/teamAPI";
import { logout } from "@/app/store/userStore";
import Logo from "@/app/assets/img/logo.svg";
import Logout from "@/app/assets/icons/logout-icon.svg";

function HeaderComp({ onSearchFocus, onSearchChange }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuth } = useSelector((state) => state.user);
    const searchInputRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");

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
        const value = e.target.value;
        setSearchQuery(value);
        onSearchChange(value);
    };

    const handleSearchFocus = () => {
        onSearchFocus(searchQuery);
    };

    return (
        <div className="header">
            <div className="header__wrapper">
                <div className="header__logo-wrapper">
                    <Image src={Logo} alt="logo" />
                </div>
                {isAuth && (
                    <div className="header__search">
                        <div className="header__search-bar">
                            <Image
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
                        <div className="header__settings">
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
            </div>
            <div className="header__divider"></div>
        </div>
    );
}

export { HeaderComp };
