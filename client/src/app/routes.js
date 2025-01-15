import { ADMIN_ROUTE, MAIN_ROUTE } from "@/utils/consts";
import { MainComp } from "./components/MainComp";

export const URLS = {
    TEST_URL: "http://localhost:3000/test",
    MAIN_URL: "http://localhost:3000/",
    DOCUMENTATION_URL: "http://localhost:3000/documentation",
    DASHBOARD_URL: "http://localhost:3000/dashboard",
};

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
    },
];

export const publicRoutes = [
    {
        path: MAIN_ROUTE,
        Component: MainComp,
    },
];
