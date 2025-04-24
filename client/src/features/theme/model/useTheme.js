"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, toggleTheme } from "@/features/theme/model/themeStore";

export const useTheme = () => {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.theme.currentTheme);

    const memoizedToggle = useCallback(
        () => dispatch(toggleTheme()),
        [dispatch],
    );
    const memoizedSet = useCallback(
        (theme) => dispatch(setTheme(theme)),
        [dispatch],
    );

    return {
        theme: currentTheme,
        toggleTheme: memoizedToggle,
        setTheme: memoizedSet,
    };
};
