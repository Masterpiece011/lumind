import { jwtDecode } from "jwt-decode";
import { $authHost, $host } from "./page";

export const login = async (email, password) => {
    const { data } = await $host.post("api/users/login", {
        email,
        password,
    });

    if (!data.token) {
        throw new Error("Токен отсутствует в ответе сервера.");
    }

    const decodedToken = jwtDecode(data.token);
    localStorage.setItem("token", data.token);
    return { user: decodedToken, token: data.token };
};

export const check = async () => {
    const { data } = await $authHost.post("api/users/auth");
    localStorage.setItem("token", data.token);
    return { user: decodedToken, token: data.token };
};