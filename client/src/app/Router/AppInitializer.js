"use client";

import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setIsAuth, setUser } from "@/app/store/userStore";
import { check } from "@/app/http/userAPI";

export default function AppInitializer({ children }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { user, token } = await check();
                dispatch(setIsAuth(true));
                dispatch(setUser(user));
            } catch {
                dispatch(setIsAuth(false));
            }
        };

        verifyAuth();
    }, [dispatch]);

    return children;
}
