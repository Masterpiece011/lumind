import axios from "axios";

const $host = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Если требуется куки
});

const $authHost = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const authInterceptor = (config) => {
    config.headers.authorization = `Bearer ${localStorage.getItem("token")}`;
    return config;
};

$authHost.interceptors.request.use(authInterceptor);

export { $host, $authHost };
