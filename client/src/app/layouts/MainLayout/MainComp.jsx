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
import { Sidebar } from "@/widgets/Sidebar/Sidebar";

import { AssignmentDetailPage } from "@/entities/assignment/ui/AssignmentDetail/AssignmentDetail";

import { HomeComp } from "@/widgets/StartComp";
import { useSearch } from "@/shared/lib/hooks/useSearch";
import { ChatPage } from "@/features/chat/ui/ChatComp";
import { SchedulePage } from "@/features/schedule/ui/SheduleComp";

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

    const handleCardClick = (basePath, hasDetailPages = false) => {
        const isOnDetailPage = hasDetailPages
            ? pathname.startsWith(`/${basePath}/`) && params.id
            : false;

        if (!pathname.startsWith(`/${basePath}`) || isOnDetailPage) {
            handleNavigation(`/${basePath}`);
        }
        setShowSearchMenu(false);
    };

    const handleTeamsCardClick = () => handleCardClick("teams", true);
    const handleUsersCardClick = () => handleCardClick("users");

    return (
        <div className="main">
            <header>
                <HeaderComp
                    onSearchFocus={handleSearchFocus}
                    onSearchChange={handleSearchChange}
                />
            </header>

            <div className="main__content">
                <Sidebar />

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
                                    onSelectTeam={(teamId) => {
                                        console.log("Clicked team ID:", teamId);
                                        handleNavigation(`/teams/${teamId}`);
                                    }}
                                    menuRef={searchMenuRef}
                                    onTeamsCardClick={handleTeamsCardClick}
                                    onUsersCardClick={handleUsersCardClick}
                                    isTeamsPageActive={pathname === "/teams"}
                                    isUsersPageActive={pathname === "/users"}
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
                              pathname.startsWith("/chats") ? (
                                <div className="chat-page-wrapper">
                                    <ChatPage userId={userId} />
                                </div>
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
                                <AssignmentDetailPage id={params.id} />
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
                            ) : !showSearchMenu &&
                              !isModalOpen &&
                              pathname.startsWith("/schedule") ? (
                                <SchedulePage />
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export { MainComp };
