"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { setIsAuth, setUser } from "@/app/store/userStore";
import { MyButton } from "../UI";
import { login } from "@/app/api/userAPI";
import * as styles from "./LoginForm.module.scss";
import * as buttonStyles from "../UI/MyButton/MyButton.module.scss";
import { useRouter } from "next/navigation";
import UserIcon from "@/app/assets/icons/user-icon.png";
import LockIcon from "@/app/assets/icons/lock-icon.png";
import Logo from "@/app/assets/img/logo.svg";

function LoginForm() {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const signIn = async () => {
        const { email, password } = form;
        console.log("Отправляемые данные:", { email, password });

        try {
            const { user, token } = await login(email, password);
            console.log("Ответ с сервера:", user);

            dispatch(setIsAuth(true));
            dispatch(setUser(user));
            localStorage.setItem("token", token);
            router.push("/main");
        } catch (error) {
            console.error(
                "Ошибка авторизации:",
                error.response?.data || error.message,
            );
        }
    };

    function handleInputEmail(event) {
        setForm((prev) => ({
            ...prev,
            email: event.target.value,
        }));
    }

    function handleInputPassword(event) {
        setForm((prev) => ({
            ...prev,
            password: event.target.value,
        }));
    }

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <form
                    className={styles.form}
                    onSubmit={(event) => {
                        event.preventDefault();
                        signIn();
                    }}
                >
                    <div className={styles.formContent}>
                        <div className={styles.fieldsWrapper}>
                            <h1 className={styles.title}>Авторизация</h1>
                            <div className={styles.inputWrapper}>
                                <Image
                                    src={UserIcon}
                                    alt="User Icon"
                                    className={styles.icon}
                                />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="Логин"
                                    onChange={handleInputEmail}
                                    value={form.email}
                                />
                            </div>

                            <div className={styles.inputWrapper}>
                                <Image
                                    src={LockIcon}
                                    alt="User Icon"
                                    className={styles.icon}
                                />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Пароль"
                                    onChange={handleInputPassword}
                                    value={form.password}
                                />
                            </div>

                            <div className={styles.options}>
                                <div className={styles.checkboxWrapper}>
                                    <input
                                        id="showPassword"
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    />
                                    <label htmlFor="showPassword">
                                        Показать пароль
                                    </label>
                                </div>
                                <a href="#" className={styles.forgotPassword}>
                                    Забыли пароль? Восстановить
                                </a>
                            </div>
                        </div>
                        <div className={styles.logoWrapper}>
                            <Image src={Logo} alt="Logo" />
                        </div>
                    </div>
                    <MyButton
                        text="Войти"
                        className={buttonStyles.loginButton}
                    />
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
