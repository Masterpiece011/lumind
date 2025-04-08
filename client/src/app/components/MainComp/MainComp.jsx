"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import "./MainComp.scss";
import { HeaderComp } from "../HeaderComp";
import { TeamsPage } from "../views/TeamsComp";
import { AssignmentsPage } from "../views/Assignments";
import { UsersPage } from "../views/UsersComp";
import { SearchMenu } from "../views/SearchMenu";
import TeamDetailPage from "@/app/teams/[id]/page";
import AssignmentsDetailPage from "@/app/assignments/[id]/page";

import { Icon } from "../ui/icons";
import HomeIcon from "@/app/assets/icons/home-icon.svg";
import ChatIcon from "@/app/assets/icons/chat-icon.svg";
import TeamsIcon from "@/app/assets/icons/teams-icon.svg";
import AssignmentsIcon from "@/app/assets/icons/assignments-icon.svg";
import NotificationsIcon from "@/app/assets/icons/notification-icon.svg";
import ScheduleIcon from "@/app/assets/icons/schedule-icon.svg";
import { useModal } from "../uikit/UiModal/ModalProvider";

const MainComp = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const searchMenuRef = useRef(null);

    const [showSearchMenu, setShowSearchMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMouseOver, setIsMouseOver] = useState(false);
    const { isModalOpen, closeModal } = useModal();

    const handleSearchFocus = (currentQuery) => {
        setSearchQuery(currentQuery);
        setShowSearchMenu(true);
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (!showSearchMenu) setShowSearchMenu(true);
    };

    const handleMouseEnter = () => {
        setIsMouseOver(true);
    };

    const handleMouseLeave = () => {
        setIsMouseOver(false);
        setTimeout(() => {
            if (!isMouseOver && !hasOpenModal) {
                setShowSearchMenu(false);
            }
        }, 300);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isModalOpen) return;

            if (
                searchMenuRef.current &&
                searchMenuRef.current.contains(event.target)
            ) {
                return;
            }

            const searchInput = document.querySelector(".header__search-input");
            if (searchInput && !searchInput.contains(event.target)) {
                setShowSearchMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    useEffect(() => {
        if (showSearchMenu || isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [showSearchMenu, isModalOpen]);

    useEffect(() => {
        setShowSearchMenu(false);
        setSearchQuery("");
    }, [pathname, params]);

    const handleNavigation = (path) => {
        router.push(path);
    };

    const isActive = (path) => {
        if (path === "/") return pathname === path;
        return pathname.startsWith(path);
    };

    return (
        <div className="main">
            <header>
                <HeaderComp
                    onSearchFocus={handleSearchFocus}
                    onSearchChange={handleSearchChange}
                />
            </header>
            <div className="main__content">
                <aside className="main__sidebar">
                    <ul className="main__sidebar-list">
                        <Icon
                            src={HomeIcon}
                            alt="home-icon"
                            onClick={() => handleNavigation("/")}
                            className={
                                isActive("/")
                                    ? "main__sidebar-icon--active"
                                    : ""
                            }
                        />
                        <Icon
                            src={NotificationsIcon}
                            alt="notifications-icon"
                            onClick={() => handleNavigation("/notifications")}
                            className={
                                isActive("/notifications")
                                    ? "main__sidebar-icon--active"
                                    : ""
                            }
                        />
                        <Icon
                            src={TeamsIcon}
                            alt="teams-icon"
                            onClick={() => handleNavigation("/teams")}
                            className={
                                isActive("/teams")
                                    ? "main__sidebar-icon--active"
                                    : ""
                            }
                        />
                        <Icon
                            src={ChatIcon}
                            alt="chat-icon"
                            onClick={() => handleNavigation("/chat")}
                            className={
                                isActive("/chat")
                                    ? "main__sidebar-icon--active"
                                    : ""
                            }
                        />
                        <Icon
                            src={AssignmentsIcon}
                            alt="assignments-icon"
                            onClick={() => handleNavigation("/assignments")}
                            className={
                                isActive("/assignments")
                                    ? "main__sidebar-icon--active"
                                    : ""
                            }
                        />
                        <Icon
                            src={ScheduleIcon}
                            alt="schedule-icon"
                            onClick={() => handleNavigation("/schedule")}
                            className={
                                isActive("/schedule")
                                    ? "main__sidebar-icon--active"
                                    : ""
                            }
                        />
                    </ul>
                </aside>

                <section className="main__page-content">
                    <div className="main__content-wrapper">
                        {showSearchMenu && (
                            <div
                                ref={searchMenuRef}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className={`main__search-wrapper ${
                                    showSearchMenu
                                        ? "main__search-wrapper_visible"
                                        : ""
                                }`}
                            >
                                <SearchMenu
                                    searchQuery={searchQuery}
                                    onSelectTeam={(teamId) =>
                                        handleNavigation(`/teams/${teamId}`)
                                    }
                                />
                            </div>
                        )}

                        <div
                            className={`main__page ${showSearchMenu || isModalOpen ? "main__page_blurred" : ""}`}
                        >
                            {!showSearchMenu &&
                            !isModalOpen &&
                            pathname.startsWith("/teams/") &&
                            params.id ? (
                                <TeamDetailPage
                                    id={params.id}
                                    onSelectAssignment={(assignmentId) =>
                                        handleNavigation(
                                            `/assignments/${assignmentId}`,
                                        )
                                    }
                                />
                            ) : !showSearchMenu &&
                              !isModalOpen &&
                              pathname.startsWith("/assignments/") &&
                              params.id ? (
                                <AssignmentsDetailPage id={params.id} />
                            ) : !showSearchMenu &&
                              !isModalOpen &&
                              pathname.startsWith("/teams") ? (
                                <TeamsPage
                                    onSelectTeam={(teamId) =>
                                        handleNavigation(`/teams/${teamId}`)
                                    }
                                />
                            ) : !showSearchMenu &&
                              !isModalOpen &&
                              pathname.startsWith("/assignments") ? (
                                <AssignmentsPage
                                    onSelectAssignment={(assignmentId) =>
                                        handleNavigation(
                                            `/assignments/${assignmentId}`,
                                        )
                                    }
                                />
                            ) : !showSearchMenu &&
                              !isModalOpen &&
                              pathname.startsWith("/users") ? (
                                <UsersPage />
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export { MainComp };
