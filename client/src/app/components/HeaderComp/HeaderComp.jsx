"use client";

import React from "react";
import Logo from "@/app/assets/img/logo.svg";
import Image from "next/image";
import Settings from "@/app/assets/icons/settings.svg";
import * as styles from "./HeaderComp.module.scss";
import * as buttonStyles from "../UI/MyButton/MyButton.module.scss";
import { MyButton } from "../UI";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/app/store/userStore";

function HeaderComp() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuth } = useSelector((state) => state.user);

    const handleLoginClick = () => {
        router.push("/login");
    };

    const handleLogoutClick = () => {
        dispatch(logout());
        router.push("/");
    };

    return (
        <div className={styles.header}>
            <div className={styles.headerWrapper}>
                <div className={styles.logoWrapper}>
                    <Image src={Logo} alt="logo" />
                </div>
                <div className={styles.contentWrapper}>
                    <div className={styles.settingsWrapper}>
                        <Image src={Settings} alt="settings" />
                    </div>
                    {isAuth ? (
                        <MyButton
                            text="ВЫХОД"
                            className={buttonStyles.headerButton}
                            onClick={handleLogoutClick}
                        />
                    ) : (
                        <MyButton
                            text="ВОЙТИ"
                            className={buttonStyles.headerButton}
                            onClick={handleLoginClick}
                        />
                    )}
                </div>
            </div>
            <div className={styles.divider}></div>
        </div>
    );
}

export { HeaderComp };
