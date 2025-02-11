"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { check } from "@/app/api/userAPI";
import { setUser, setIsAuth } from "@/app/store/userStore";
import { MainComp } from "@/app/components/MainComp";

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
            setLoading(true);
            const token = Cookies.get("token");

            if (!token) {
                dispatch(setIsAuth(false));
                router.push("/");
                setLoading(false);
                return;
            }

            try {
                const { user: authUser } = await check();
                dispatch(setUser(authUser));
                dispatch(setIsAuth(true));
            } catch {
                Cookies.remove("token");
                dispatch(setIsAuth(false));
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [dispatch, router]);

    useEffect(() => {
        if (!loading) {
            const currentURL = `${pathname}${searchParams ? `?${searchParams}` : ""}`;
            window.history.pushState({ path: currentURL }, "", currentURL);
        }
    }, [pathname, searchParams, loading]);

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
