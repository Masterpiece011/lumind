import axios from "axios";
import Cookies from "js-cookie";

const $host = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const $authHost = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

$authHost.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { $host, $authHost };
