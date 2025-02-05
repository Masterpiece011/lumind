"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { check } from "@/app/api/userAPI";
import { setUser, setIsAuth } from "@/app/store/userStore";

const AppRouter = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { isAuth } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                dispatch(setIsAuth(false));
                await router.push("/");
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
                await router.push("/");
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [dispatch, isAuth, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default AppRouter;
