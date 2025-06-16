"use client";

import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/shared/lib/hooks/useWebsocket";

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

import "./MainComp.scss";
import { InstructorAssignmentFlow } from "@/features/instructor";
import { TaskCreateForm } from "@/features/instructor/ui/TaskCreateForm/TaskCreateForm";
import { AssignmentCreateForm } from "@/features/instructor/ui/AssignmentCreateForm/AssignmentCreateForm";
import { FilesPage } from "@/entities/files/ui/Files/FilesPage";

const MainComp = () => {
    const router = useRouter();
    const pathname = usePathname();
    const isAuth = useSelector((state) => state.user.isAuth);
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

    // Инициализация WebSocket
    const { sendMessage, isConnected } = useWebSocket(
        "ws://localhost:8080",
        userId,
    );

    // Пример отправки сообщения
    const handleTestMessage = () => {
        sendMessage({
            type: "CHAT_MESSAGE",
            content: "Привет от фронтенда!",
            chatId: "123",
        });
    };

    // Защита роутов
    useEffect(() => {
        if (!isAuth && pathname !== "/login") {
            router.replace("/login");
        }
    }, [isAuth, pathname, router]);

    // Блокируем рендер для неавторизованных пользователей
    if (!isAuth) {
        return null;
    }

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
    const handleFilesCardClick = () => handleCardClick("files");

    const renderAssignmentsSection = () => {
        if (pathname.startsWith("/assignments/students-assignments")) {
            return <InstructorAssignmentFlow />;
        } else if (pathname.startsWith("/assignments/") && params.id) {
            return <AssignmentDetailPage id={params.id} />;
        }
        return (
            <AssignmentsPage
                userId={userId}
                onSelectAssignment={(assignmentId) => {
                    if (userRole === "INSTRUCTOR") {
                        // Сначала переходим к списку студентов
                        router.push("/assignments/students-assignments");
                        // Затем в useEffect InstructorAssignmentFlow загрузим данные
                    } else {
                        // Для студентов сразу переходим к деталям
                        router.push(`/assignments/${assignmentId}`);
                    }
                }}
            />
        );
    };

    return (
        <div className="main">
            {isConnected ? (
                <div className="connection-status connected">Online</div>
            ) : (
                <div className="connection-status disconnected">Offline</div>
            )}
            <HeaderComp
                onSearchFocus={handleSearchFocus}
                onSearchChange={handleSearchChange}
            />

            <div className="main__content">
                <Sidebar />

                <section className="main__page-content">
                    {showSearchMenu && (
                        <div
                            ref={searchMenuRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="main__search-overlay"
                        >
                            <SearchMenu
                                searchQuery={searchQuery}
                                onSelectTeam={(teamId) =>
                                    handleNavigation(`/teams/${teamId}`)
                                }
                                menuRef={searchMenuRef}
                                onTeamsCardClick={handleTeamsCardClick}
                                onUsersCardClick={handleUsersCardClick}
                                onFilesCardClick={handleFilesCardClick}
                                isTeamsPageActive={pathname === "/teams"}
                                isUsersPageActive={pathname === "/users"}
                                isFilesPageActive={pathname === "/files"}
                            />
                        </div>
                    )}

                    <div
                        className={`main__page ${
                            isModalOpen ? "main__page_blurred" : ""
                        }`}
                    >
                        {pathname === "/" && !isModalOpen ? (
                            <HomeComp />
                        ) : pathname.startsWith("/chats") && !isModalOpen ? (
                            <div className="chat-page-wrapper">
                                <ChatPage userId={userId} />
                            </div>
                        ) : pathname.startsWith("/teams/") && params.id ? (
                            <TeamDetailPage
                                id={params.id}
                                onSelectAssignment={(assignmentId) =>
                                    handleNavigation(
                                        `/assignments/${assignmentId}`,
                                    )
                                }
                            />
                        ) : pathname.startsWith("/teams") && userId ? (
                            <TeamsPage
                                userId={userId}
                                onSelectTeam={(teamId) =>
                                    handleNavigation(`/teams/${teamId}`)
                                }
                            />
                        ) : pathname.startsWith("/users") ? (
                            <UsersPage />
                        ) : pathname.startsWith("/files") ? (
                            <FilesPage />
                        ) : pathname.startsWith("/schedule") ? (
                            <SchedulePage />
                        ) : pathname === "/assignments/create" ? (
                            <AssignmentCreateForm />
                        ) : pathname === "/assignments/create-task" ? (
                            <TaskCreateForm />
                        ) : (
                            renderAssignmentsSection()
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export { MainComp };
