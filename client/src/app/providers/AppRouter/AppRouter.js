"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { check, getUserById } from "@/shared/api/userAPI";
import { setUser, setIsAuth } from "@/entities/user/model/userStore";
import { MainComp } from "@/app/layouts/MainLayout";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

const publicRoutes = ["/login", "/register", "/password-reset"];

const AppRouter = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, isAuth } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [verifiedAuth, setVerifiedAuth] = useState(false);

    const needsMainComp =
        pathname.startsWith("/teams") ||
        pathname.startsWith("/assignments") ||
        pathname.startsWith("/chats") ||
        pathname.startsWith("/schedule") ||
        pathname.startsWith("/users");

    useEffect(() => {
        const verifyAuth = async () => {
            // Пропускаем проверку для публичных маршрутов
            if (publicRoutes.includes(pathname)) {
                setLoading(false);

                return;
            }

            try {
                const { user: authUser } = await check();

                console.log("authUser", authUser);

                if (!authUser) {
                    throw new Error("Not authenticated");
                }

                const userData = await getUserById(authUser.id);
                console.log(userData);

                dispatch(setUser(userData));
                dispatch(setIsAuth(true));
                setVerifiedAuth(true);
            } catch (error) {
                console.error("Auth verification failed:", error);
                if (!publicRoutes.includes(pathname)) {
                    router.replace("/login");
                }
                dispatch(setIsAuth(false));
            } finally {
                setLoading(false);
            }
        };

        // Проверяем аутентификацию только при первом рендере
        if (!verifiedAuth) {
            verifyAuth();
        }
    }, [dispatch, pathname, router, verifiedAuth]);

    // Обновляем URL без перезагрузки
    useEffect(() => {
        if (!loading && !isAuth) {
            const currentURL = `${pathname}${searchParams ? `?${searchParams}` : ""}`;
            window.history.replaceState({ path: currentURL }, "", currentURL);
        }
    }, [isAuth]);

    if (loading) {
        return <ClockLoader loading={loading} />;
    }

    // Разрешаем доступ к публичным маршрутам без аутентификации
    if (publicRoutes.includes(pathname)) {
        return <>{children}</>;
    }

    // Для защищенных маршрутов проверяем аутентификацию
    // if (!isAuth) {
    //     return <ClockLoader loading={true} />;
    // }

    return needsMainComp ? <MainComp>{children}</MainComp> : <>{children}</>;
};

export default AppRouter;
