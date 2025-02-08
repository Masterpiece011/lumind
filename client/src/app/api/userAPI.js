import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { $authHost, $host } from "./page";

export const login = async (email, password) => {
    const { data } = await $host.post("api/users/login", { email, password });

    if (!data.token) {
        throw new Error("Токен отсутствует в ответе сервера.");
    }

    const decodedToken = jwtDecode(data.token);

    Cookies.set("token", data.token, { expires: 1, secure: true });

    return { user: decodedToken, token: data.token };
};

export const check = async () => {
    const { data } = await $authHost.get("api/users/auth");
    return {
        user: data.user,
        token: Cookies.get("token"),
    };
};

export const getUsers = createAsyncThunk("users/getUsers", async () => {
    try {
        const response = await $authHost.get("/api/users");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения пользователей",
        );
    }
});

export const getUserById = async (userId) => {
    try {
        const response = await $authHost.get(`/api/users/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Ошибка получения пользователя",
        );
    }
};
