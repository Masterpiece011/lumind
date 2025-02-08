"use client";

import React, { useState } from "react";

import { HeaderComp } from "../HeaderComp";
import { TeamsPage } from "../views/TeamsComp";
import { AssignmentsPage } from "../views/Assignments";
import { UsersPage } from "../views/UsersComp";
import Icon from "@/app/ui/icons/Icon";

import TeamDetailPage from "@/app/teams/[id]/page";
import AssignmentsDetailPage from "@/app/assignments/[id]/page";

import * as styles from "./MainComp.module.scss";

import Home from "@/app/assets/icons/home-icon.svg";
import Chat from "@/app/assets/icons/chat-icon.svg";
import Teams from "@/app/assets/icons/teams-icon.svg";
import Assignments from "@/app/assets/icons/assignments-icon.svg";
import Notifications from "@/app/assets/icons/notification-icon.svg";

const MainComp = () => {
    const [selectedComponent, setSelectedComponent] = useState("teams");
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    return (
        <div className={styles.container}>
            <header>
                <HeaderComp setSelectedComponent={setSelectedComponent} />
            </header>
            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    <ul>
                        <Icon
                            src={Home}
                            alt="home"
                            onClick={() => setSelectedComponent("teams")}
                        />

                        <Icon
                            src={Notifications}
                            alt="notifications"
                            onClick={() =>
                                setSelectedComponent("notifications")
                            }
                        />

                        <Icon
                            src={Teams}
                            alt="teams"
                            onClick={() => setSelectedComponent("teams")}
                        />

                        <Icon
                            src={Chat}
                            alt="chat"
                            onClick={() => setSelectedComponent("chat")}
                        />

                        <Icon
                            src={Assignments}
                            alt="assignments"
                            onClick={() => setSelectedComponent("assignments")}
                        />
                    </ul>
                </aside>

                <section className={styles.pageContent}>
                    {selectedComponent === "teams" && (
                        <TeamsPage
                            onSelectTeam={(id) => {
                                setSelectedTeamId(id);
                                setSelectedComponent("teamDetail");
                            }}
                        />
                    )}
                    {selectedComponent === "teamDetail" && (
                        <TeamDetailPage id={selectedTeamId} />
                    )}

                    {selectedComponent === "assignments" && (
                        <AssignmentsPage
                            onSelectAssignment={(id) => {
                                setSelectedAssignmentId(id);
                                setSelectedComponent("assignmentDetail");
                            }}
                        />
                    )}
                    {selectedComponent === "assignmentDetail" && (
                        <AssignmentsDetailPage id={selectedAssignmentId} />
                    )}

                    {selectedComponent === "notifications" && (
                        <div>Страница уведомлений</div>
                    )}

                    {selectedComponent === "chats" && <div>Страница чата</div>}

                    {selectedComponent === "users" && <UsersPage />}
                </section>
            </div>
        </div>
    );
};

export { MainComp };
