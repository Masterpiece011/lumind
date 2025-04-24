"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const ThemeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.theme.currentTheme);

    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.setAttribute("data-theme", currentTheme);
            localStorage.setItem("theme", currentTheme);
        }
    }, [currentTheme]);

    return children;
};
