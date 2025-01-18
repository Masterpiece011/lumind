"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setIsAuth, setUser } from "@/app/store/userStore";
import { MyButton } from "../UI";
import { login } from "@/app/http/userAPI";
import * as styles from "./RegistrationForm.module.scss";
import { URLS } from "@/app/routes";
import { useRouter } from "next/navigation";

function RegistrationForm() {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
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
            router.push(URLS.MAIN_URL);
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
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                signIn();
            }}
        >
            <label htmlFor="email">Почта</label>
            <input
                id="email"
                type="email"
                required
                onChange={handleInputEmail}
                value={form.email}
            />

            <label htmlFor="password">Пароль</label>
            <input
                id="password"
                type="password"
                required
                onChange={handleInputPassword}
                value={form.password}
            />

            <MyButton text="Войти" />
        </form>
    );
}

export default RegistrationForm;
