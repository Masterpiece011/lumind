"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { setIsAuth, setUser } from "@/entities/user/model/userStore";
import { MyButton } from "@/shared/uikit/MyButton";
import { login } from "@/shared/api/userAPI";
import "./style.scss";
import * as buttonStyles from "../../../../shared/uikit/MyButton/MyButton.module.scss";
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
            Cookies.set("token", token, { expires: 1, path: "/" });
            router.push("/");
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
        <div className="login">
            <div className="login__wrapper">
                <form
                    className="login__form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        signIn();
                    }}
                >
                    <div className="login__content">
                        <div className="login__fields">
                            <h1 className="login__title">Авторизация</h1>
                            <div className="login__input-wrapper">
                                <Image
                                    src={UserIcon}
                                    alt="User Icon"
                                    className="login__icon"
                                />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="Логин"
                                    onChange={handleInputEmail}
                                    value={form.email}
                                    className="login__input"
                                />
                            </div>

                            <div className="login__input-wrapper">
                                <Image
                                    src={LockIcon}
                                    alt="User Icon"
                                    className="login__icon"
                                />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Пароль"
                                    onChange={handleInputPassword}
                                    value={form.password}
                                    className="login__input"
                                />
                            </div>

                            <div className="login__options">
                                <div className="login__checkbox-wrapper">
                                    <input
                                        id="showPassword"
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="login__checkbox"
                                    />
                                    <label
                                        htmlFor="showPassword"
                                        className="login__label"
                                    >
                                        Показать пароль
                                    </label>
                                </div>
                                <a href="#" className="login__forgot-password">
                                    Забыли пароль? Восстановить
                                </a>
                            </div>
                        </div>
                        <div className="login__logo-wrapper">
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
