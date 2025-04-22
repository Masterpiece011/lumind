"use client";

import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { HeaderComp } from "@/widgets/HeaderComp";
import { TeamsPage } from "@/entities/team/ui/Teams";
import { AssignmentsPage } from "@/entities/assignment/ui/Assignments";
import { UsersPage } from "@/entities/user/ui/Users";
import { SearchMenu } from "@/widgets/SearchMenu";
import { TeamDetailPage } from "@/entities/team/ui/TeamDetail";
import AssignmentsDetailPage from "@/entities/assignment/ui/AssignmentDetail";
import { HomeComp } from "@/widgets/StartComp";
import { Icon } from "@/shared/uikit/icons";
import { useSearch } from "@/shared/lib/hooks/useSearch";

import HomeIcon from "@/app/assets/icons/home-icon.svg";
import ChatIcon from "@/app/assets/icons/chat-icon.svg";
import TeamsIcon from "@/app/assets/icons/teams-icon.svg";
import AssignmentsIcon from "@/app/assets/icons/assignments-icon.svg";
import NotificationsIcon from "@/app/assets/icons/notification-icon.svg";
import ScheduleIcon from "@/app/assets/icons/schedule-icon.svg";

import "./style.scss";

const MainComp = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const searchMenuRef = useRef(null);

    const {
        showSearchMenu,
        searchQuery,
        isModalOpen,
        handleSearchFocus,
        handleSearchChange,
        handleMouseEnter,
        handleMouseLeave,
        setShowSearchMenu,
    } = useSearch();

    const userId = useSelector(
        (state) => state.user?.user?.id || null,
        (prev, next) => prev === next,
    );

    useEffect(() => {
        setShowSearchMenu(false);
    }, [pathname, params, setShowSearchMenu]);

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
                            pathname === "/" ? (
                                <HomeComp />
                            ) : !showSearchMenu &&
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
                              pathname.startsWith("/teams") &&
                              userId ? (
                                <TeamsPage
                                    userId={userId}
                                    onSelectTeam={(teamId) =>
                                        handleNavigation(`/teams/${teamId}`)
                                    }
                                />
                            ) : !showSearchMenu &&
                              !isModalOpen &&
                              pathname.startsWith("/assignments") ? (
                                <AssignmentsPage
                                    userId={userId}
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
