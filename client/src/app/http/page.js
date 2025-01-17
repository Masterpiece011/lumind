import axios from "axios";

const $host = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const $authHost = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

$authHost.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { $host, $authHost };
