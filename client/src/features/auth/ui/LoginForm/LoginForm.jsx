"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setIsAuth, setUser } from "@/entities/user/model/userStore";
import { login } from "@/shared/api/userAPI";

import "./LoginForm.scss";

import Cookies from "js-cookie";
import Image from "next/image";
import { MyButton } from "@/shared/uikit/MyButton";

import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const signIn = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const { email, password } = form;

        try {
            const { user, token } = await login(email, password);

            dispatch(setIsAuth(true));
            dispatch(setUser(user));
            Cookies.set("token", token, { expires: 1, path: "/" });

            // Явный редирект после успешного входа
            router.replace("/");
        } catch (error) {
            console.error("Ошибка авторизации:", error);
        } finally {
            setIsSubmitting(false);
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

                                <div>
                                    <MyButton
                                        text="Войти"
                                        className={buttonStyles.loginButton}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="login__logo-wrapper">
                            <Image src={Logo} alt="Logo" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
