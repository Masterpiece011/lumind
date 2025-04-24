import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { $authHost, $host } from "./page";

export const login = async (email, password) => {
    try {
        const { data } = await $host.post("api/users/login", {
            email,
            password,
        });

        if (!data.token) {
            throw new Error("Токен отсутствует в ответе сервера.");
        }

        const decodedToken = jwtDecode(data.token);

        Cookies.set("token", data.token, { expires: 1, secure: true });

        return { user: decodedToken, token: data.token };
    } catch (error) {
        console.log("Ошибка аутентификации");
    }
};

export const check = async () => {
    const { data } = await $authHost.get("api/users/auth");
    return {
        user: data.user,
        token: Cookies.get("token"),
    };
};

export const getUsers = createAsyncThunk(
    "users/getUsers",
    async ({
        page = 1,
        quantity = 100,
        order = "ASC",
        search_text = "",
    } = {}) => {
        try {
            const { data } = await $authHost.post("/api/users", {
                page,
                quantity,
                order,
                search_text,
            });
            return { users: data.data };
        } catch (error) {
            throw new Error(
                error?.response?.data?.message ||
                    "Ошибка получения пользователей",
            );
        }
    },
);

export const getUserById = async (userId) => {
    try {
        const { data } = await $authHost.get(`/api/users/${userId}`);
        return data.user_data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения пользователя",
        );
    }
};
