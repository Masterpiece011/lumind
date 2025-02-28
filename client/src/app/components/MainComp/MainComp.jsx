"use client";

import React, { useState, useEffect } from "react";
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

    const [showSearchMenu, setShowSearchMenu] = useState(false);

    const onSelectSearch = () => {
        setShowSearchMenu((prev) => !prev);
    };

    useEffect(() => {
        setShowSearchMenu(false);
    }, [pathname, params]);

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <div className={styles.container}>
            <header>
                <HeaderComp onSelectSearch={onSelectSearch} />
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
                    {showSearchMenu ? (
                        <SearchMenu
                            onSelectTeam={(teamId) =>
                                handleNavigation(`/teams/${teamId}`)
                            }
                        />
                    ) : pathname.startsWith("/teams/") && params.id ? (
                        <TeamDetailPage id={params.id} />
                    ) : pathname.startsWith("/assignments/") && params.id ? (
                        <AssignmentsDetailPage id={params.id} />
                    ) : pathname.startsWith("/teams") ? (
                        <TeamsPage
                            onSelectTeam={(teamId) =>
                                handleNavigation(`/teams/${teamId}`)
                            }
                        />
                    ) : pathname.startsWith("/assignments") ? (
                        <AssignmentsPage
                            onSelectAssignment={(assignmentId) =>
                                handleNavigation(`/assignments/${assignmentId}`)
                            }
                        />
                    ) : pathname.startsWith("/users") ? (
                        <UsersPage />
                    ) : null}
                </section>
            </div>
        </div>
    );
};

export { MainComp };
