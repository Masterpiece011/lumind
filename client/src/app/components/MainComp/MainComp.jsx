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

import Icon from "@/app/ui/icons/Icon";
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
        setShowSearchMenu(true);
    };

    const handleSelectTeam = (teamId) => {
        router.push(`/teams/${teamId}`);
    };

    const handleSelectAssignment = (assignmentId) => {
        router.push(`/assignments/${assignmentId}`);
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
                            onClick={() => router.push("/")}
                        />
                        <Icon
                            src={Notifications}
                            alt="notifications"
                            onClick={() => router.push("/notifications")}
                        />
                        <Icon
                            src={Teams}
                            alt="teams"
                            onClick={() => router.push("/teams")}
                        />
                        <Icon
                            src={Chat}
                            alt="chat"
                            onClick={() => router.push("/chat")}
                        />
                        <Icon
                            src={Assignments}
                            alt="assignments"
                            onClick={() => router.push("/assignments")}
                        />
                    </ul>
                </aside>

                <section className={styles.pageContent}>
                    {showSearchMenu ? (
                        <SearchMenu />
                    ) : pathname.startsWith("/teams/") && params.id ? (
                        <TeamDetailPage id={params.id} />
                    ) : pathname.startsWith("/assignments/") && params.id ? (
                        <AssignmentsDetailPage id={params.id} />
                    ) : pathname.startsWith("/teams") ? (
                        <TeamsPage onSelectTeam={handleSelectTeam} />
                    ) : pathname.startsWith("/assignments") ? (
                        <AssignmentsPage
                            onSelectAssignment={handleSelectAssignment}
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
