"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import * as styles from "./MainComp.module.scss";
import { HeaderComp } from "../HeaderComp";
import { TeamsPage } from "../views/TeamsComp";
import { AssignmentsPage } from "../views/Assignments";
import { UsersPage } from "../views/UsersComp";
import { SearchMenu } from "../views/SearchMenu";
import TeamDetailPage from "@/app/teams/[id]/page";
import AssignmentsDetailPage from "@/app/assignments/[id]/page";
import { Icon } from "../ui/icons";
import Home from "@/app/assets/icons/home-icon.svg";
import Chat from "@/app/assets/icons/chat-icon.svg";
import Teams from "@/app/assets/icons/teams-icon.svg";
import Assignments from "@/app/assets/icons/assignments-icon.svg";
import Notifications from "@/app/assets/icons/notification-icon.svg";

const MainComp = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const searchMenuRef = useRef(null);

    const [showSearchMenu, setShowSearchMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMouseOver, setIsMouseOver] = useState(false);

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
            if (!isMouseOver) {
                setShowSearchMenu(false);
            }
        }, 300);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchMenuRef.current &&
                !searchMenuRef.current.contains(event.target)
            ) {
                const searchInput = document.querySelector(
                    ".header__search-input",
                );
                if (searchInput && !searchInput.contains(event.target)) {
                    setShowSearchMenu(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setShowSearchMenu(false);
        setSearchQuery("");
    }, [pathname, params]);

    useEffect(() => {
        if (showSearchMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showSearchMenu]);

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <div className={styles.container}>
            <header>
                <HeaderComp
                    onSearchFocus={handleSearchFocus}
                    onSearchChange={handleSearchChange}
                />
            </header>
            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    <ul>
                        <Icon
                            src={Home}
                            alt="home"
                            onClick={() => handleNavigation("/")}
                        />
                        <Icon
                            src={Notifications}
                            alt="notifications"
                            onClick={() => handleNavigation("/notifications")}
                        />
                        <Icon
                            src={Teams}
                            alt="teams"
                            onClick={() => handleNavigation("/teams")}
                        />
                        <Icon
                            src={Chat}
                            alt="chat"
                            onClick={() => handleNavigation("/chat")}
                        />
                        <Icon
                            src={Assignments}
                            alt="assignments"
                            onClick={() => handleNavigation("/assignments")}
                        />
                    </ul>
                </aside>

                <section className={styles.pageContent}>
                    <div className={styles.pageContentWrapper}>
                        {showSearchMenu && (
                            <div
                                ref={searchMenuRef}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className={`${styles.searchMenuWrapper} ${
                                    showSearchMenu ? styles.visible : ""
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
                            className={`${styles.mainPageContent} ${
                                showSearchMenu ? styles.blurred : ""
                            }`}
                        >
                            {!showSearchMenu &&
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
                              pathname.startsWith("/assignments/") &&
                              params.id ? (
                                <AssignmentsDetailPage id={params.id} />
                            ) : !showSearchMenu &&
                              pathname.startsWith("/teams") ? (
                                <TeamsPage
                                    onSelectTeam={(teamId) =>
                                        handleNavigation(`/teams/${teamId}`)
                                    }
                                />
                            ) : !showSearchMenu &&
                              pathname.startsWith("/assignments") ? (
                                <AssignmentsPage
                                    onSelectAssignment={(assignmentId) =>
                                        handleNavigation(
                                            `/assignments/${assignmentId}`,
                                        )
                                    }
                                />
                            ) : !showSearchMenu &&
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
