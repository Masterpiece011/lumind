import React, { useState } from "react";
import "./RegistrationForm.css";
import { MyButton } from "../UI";
import { login } from "@/app/http/userAPI";

function RegistrationForm() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const signIn = async () => {
        const { email, password } = form;
        console.log("Отправляемые данные:", { email, password });

        try {
            const response = await login(email, password);
            console.log("Ответ сервера:", response.data);
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
            className="form"
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
