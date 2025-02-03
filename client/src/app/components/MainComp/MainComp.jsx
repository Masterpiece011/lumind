"use client";

import React, { useState } from "react";
import { HeaderComp } from "../HeaderComp";
import * as styles from "./MainComp.module.scss";
import TeamDetailPage from "@/app/teams/[id]/page";
import { TeamsPage } from "../views/TeamsComp";
import AssignmentsDetailPage from "@/app/assignments/[id]/page";
import { AssignmentsPage } from "../views/Assignments";

const MainComp = () => {
    const [selectedComponent, setSelectedComponent] = useState("teams");
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    return (
        <div className={styles.container}>
            <header>
                <HeaderComp />
            </header>
            <div className={styles.mainContent}>
                <aside className={styles.sidebar}>
                    <ul>
                        <li onClick={() => setSelectedComponent("teams")}>
                            Команды
                        </li>
                        <li onClick={() => setSelectedComponent("assignments")}>
                            Задания
                        </li>
                        <li
                            onClick={() =>
                                setSelectedComponent("notifications")
                            }
                        >
                            Уведомления
                        </li>
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
                </section>
            </div>
        </div>
    );
};

export { MainComp };
