"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { check } from "@/shared/api/userAPI";
import { setUser, setIsAuth } from "@/entities/user/model/userStore";
import { MainComp } from "@/app/layouts/MainLayout";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

const AppRouter = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, isAuth } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);

    const needsMainComp =
        pathname.startsWith("/teams") ||
        pathname.startsWith("/assignments") ||
        pathname.startsWith("/users");

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // const cookieToken = Cookies.get("token");
                // console.log("cookieToken", cookieToken);

                // if (!cookieToken) {
                //     router.push("/login");
                //     return;
                // }
                const { user: authUser } = await check();
                console.log("authUser", authUser);

                if (!authUser) {
                    router.push("/login");
                    return;
                }
                dispatch(setUser(authUser));
                dispatch(setIsAuth(true));
            } catch {
                dispatch(setIsAuth(false));
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [dispatch]);

    useEffect(() => {
        if (!loading) {
            const currentURL = `${pathname}${searchParams ? `?${searchParams}` : ""}`;
            window.history.replaceState({ path: currentURL }, "", currentURL);
        }
    }, [pathname, loading]);

    useEffect(() => {
        if (!isAuth && pathname !== "/login") {
            window.history.replaceState(null, "", "/login");
            router.replace("/login");
        }
    }, [isAuth, pathname, router]);

    useEffect(() => {
        const handlePopState = (event) => {
            if (!isAuth) {
                window.history.pushState(null, "", "/login");
                router.replace("/login");
            } else if (event.state?.path) {
                router.replace(event.state.path);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [router, isAuth]);

    if (loading) {
        return <ClockLoader loading={loading} />;
    }

    if (needsMainComp) {
        return <MainComp>{children}</MainComp>;
    }

    return <>{children}</>;
};

export default AppRouter;
