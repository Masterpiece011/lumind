"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { check } from "@/app/http/userAPI";
import { setUser, setIsAuth } from "@/app/store/userStore";

const AppRouter = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { isAuth } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem("token");
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
                localStorage.removeItem("token");
                dispatch(setIsAuth(false));
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        if (!isAuth) verifyAuth();
    }, [dispatch, isAuth, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default AppRouter;
