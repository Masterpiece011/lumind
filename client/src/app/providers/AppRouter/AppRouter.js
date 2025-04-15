"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { check } from "@/shared/api/userAPI";
import { setUser, setIsAuth } from "@/entities/user/model/userStore";
import { MainComp } from "@/app/layouts/MainLayout";

const AppRouter = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isAuth } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);

    const shouldRenderMainComp =
        pathname.startsWith("/teams") ||
        pathname.startsWith("/assignments") ||
        pathname.startsWith("/users");

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { user: authUser } = await check();
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
        const handlePopState = (event) => {
            if (event.state?.path) {
                router.replace(event.state.path);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (shouldRenderMainComp) {
        return <MainComp>{children}</MainComp>;
    }

    return <>{children}</>;
};

export default AppRouter;
