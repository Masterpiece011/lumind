import AdminPage from "../features/admin/ui/AdminComp/AdminComp";
import { MainComp } from "./layouts/MainLayout";

export const URLS = {
    TEST_URL: "http://localhost:3000/test",
    MAIN_URL: "http://localhost:3000/main",
    DOCUMENTATION_URL: "http://localhost:3000/documentation",
    DASHBOARD_URL: "http://localhost:3000/dashboard",
    Start_URL: "http://localhost:3000/",
};

export const authRoutes = [
    {
        path: "/admin",
        Component: AdminPage,
    },
];

export const publicRoutes = [
    {
        path: "/main",
        Component: MainComp,
    },
];
