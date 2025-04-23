"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal } from "@/shared/uikit/UiModal/ModalProvider";

export const useSearch = () => {
    const [showSearchMenu, setShowSearchMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMouseOver, setIsMouseOver] = useState(false);
    const { isModalOpen } = useModal();

    const handleSearchFocus = useCallback((currentQuery) => {
        setSearchQuery(currentQuery);
        setShowSearchMenu(true);
    }, []);

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
        setShowSearchMenu(true);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsMouseOver(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsMouseOver(false);
        setTimeout(() => {
            if (!isMouseOver && !isModalOpen) {
                setShowSearchMenu(false);
            }
        }, 300);
    }, [isMouseOver, isModalOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isModalOpen) return;

            const userItem = event.target.closest(".search-menu__user-item");
            if (userItem) return;

            const searchInput = document.querySelector(".header__search-input");
            if (searchInput && searchInput.contains(event.target)) {
                return;
            }

            setShowSearchMenu(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    useEffect(() => {
        document.body.style.overflow =
            showSearchMenu || isModalOpen ? "hidden" : "auto";
    }, [showSearchMenu, isModalOpen]);

    return {
        showSearchMenu,
        searchQuery,
        handleSearchFocus,
        handleSearchChange,
        handleMouseEnter,
        handleMouseLeave,
        setShowSearchMenu,
        isModalOpen,
    };
};
