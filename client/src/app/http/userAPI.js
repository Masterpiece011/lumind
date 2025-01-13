import { $authHost, $host } from "./page";

export const login = async (email, password) => {
    const response = await $host.post("api/users/login", {
        email,
        password,
    });
    return response;
};

export const check = async () => {
    const response = await $host.post("api/users/auth");
    return response;
};
