"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getTeamById, getTeamFiles } from "@/shared/api/teamAPI";
import { getAssignments } from "@/shared/api/assignmentsAPI";
import "../TeamDetail/style.scss";
import { MyButton } from "@/shared/uikit/MyButton";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

import { Icon } from "@/shared/uikit/icons";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignment from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";
import { FileItem } from "@/shared/ui/FileComp";

const TeamDetailPage = ({ onSelectAssignment }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const {
        currentTeam,
        loading,
        error,
        teamFiles = [],
    } = useSelector((state) => state.teams);
    const { assignments: assignmentsData = [] } = useSelector(
        (state) => state.assignments,
    );
    const user_id = useSelector((state) => state.user.user?.id);

    const [activeTab, setActiveTab] = useState("posts");
    const [assignmentFilter, setAssignmentFilter] = useState("all");

    useEffect(() => {
        if (id && user_id) {
            dispatch(getTeamById({ teamId: id, userId: user_id }));
            dispatch(getAssignments({ userId: user_id, filter: "all" }));
            dispatch(getTeamFiles(id));
        }
    }, [id, user_id, dispatch]);

    const filteredAssignments = useMemo(() => {
        const now = new Date();
        return assignmentsData
            .filter((assignment) =>
                assignment.teams?.some((team) => team.id === currentTeam?.id),
            )
            .filter((assignment) => {
                const dueDate = new Date(assignment.due_date);
                const hasSubmission = assignment.submission != null;
                switch (assignmentFilter) {
                    case "current":
                        return !hasSubmission && dueDate >= now;
                    case "completed":
                        return hasSubmission;
                    case "overdue":
                        return !hasSubmission && dueDate < now;
                    default:
                        return true;
                }
            });
    }, [assignmentsData, assignmentFilter, currentTeam]);

    const allFiles = useMemo(() => {
        const assignmentFiles = filteredAssignments.flatMap(
            (assignment) =>
                assignment.assignments_investments?.map((file) => ({
                    ...file,
                    assignmentTitle: assignment.title,
                    assignmentId: assignment.id,
                })) || [],
        );
        return [...teamFiles, ...assignmentFiles];
    }, [teamFiles, filteredAssignments]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const handleFilterChange = useCallback((filter) => {
        setAssignmentFilter(filter);
    }, []);

    const renderAssignmentCard = (assignment) => {
        const dueDate = new Date(assignment.due_date);
        const isOverdue = dueDate < new Date();
        const hasSubmission = assignment.submission != null;

        return (
            <div
                key={assignment.id}
                className="assignments__card"
                onClick={() => onSelectAssignment(assignment.id)}
            >
                <div className="assignments__header">
                    <span className="assignments__date">
                        {new Date(assignment.created_at).toLocaleDateString()}
                    </span>
                    {hasSubmission && isOverdue && (
                        <div className="assignments__status assignments__status--overdue">
                            Сдано с опозданием
                        </div>
                    )}
                    <span className="assignments__team">
                        {assignment.teams?.[0]?.name || "Неизвестно"}
                    </span>
                </div>
                <h2 className="assignments__name">{assignment.title}</h2>
                <div className="assignments__deadline">
                    Срок: {new Date(assignment.due_date).toLocaleDateString()}
                </div>
            </div>
        );
    };

    const tabContent = {
        posts: <p>Публикации команды (заглушка)</p>,
        members: (
            <div className="team__tab-content">
                <h3 className="team__tab-title">Участники команды</h3>
                <ul className="team__members-list">
                    {currentTeam?.users?.map((user) => (
                        <li className="team__member" key={user.id}>
                            <div className="team__member-info">
                                <span className="team__member-name">
                                    {user.first_name} {user.last_name}
                                </span>
                                <span className="team__member-email">
                                    ({user.email})
                                </span>
                            </div>
                        </li>
                    )) || <p className="team__no-members">Нет участников</p>}
                </ul>
            </div>
        ),
        assignments: (
            <div className="team__tab-content">
                <h3 className="team__tab-title">Задания команды</h3>
                <div className="assignments__filters">
                    {["all", "current", "completed", "overdue"].map(
                        (filterType) => (
                            <MyButton
                                key={filterType}
                                className={`assignments__filter-button ${
                                    assignmentFilter === filterType
                                        ? "assignments__filter-button--active"
                                        : ""
                                }`}
                                onClick={() => handleFilterChange(filterType)}
                            >
                                {filterType === "all"
                                    ? "Все задания"
                                    : filterType === "current"
                                      ? "Текущие"
                                      : filterType === "completed"
                                        ? "Выполненные"
                                        : "Просроченные"}
                            </MyButton>
                        ),
                    )}
                </div>
                <div className="assignments__card-wrapper">
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map(renderAssignmentCard)
                    ) : (
                        <p className="assignments__empty">
                            Нет заданий для этой команды
                        </p>
                    )}
                </div>
            </div>
        ),
        files: (
            <div className="team-files">
                <h3>Файлы команды</h3>
                {allFiles.length > 0 ? (
                    <div className="file-list">
                        {allFiles.map((file) => (
                            <FileItem
                                key={file.id}
                                fileUrl={file.file_url}
                                additionalInfo={
                                    file.assignmentTitle || "Файл команды"
                                }
                                onClick={() =>
                                    file.assignmentId &&
                                    onSelectAssignment(file.assignmentId)
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <p>Нет файлов</p>
                )}
            </div>
        ),
    };

    if (loading) return <ClockLoader />;
    if (error) return <div>Ошибка: {error}</div>;
    if (!currentTeam) return <div>Команда не найдена</div>;

    return (
        <div className="team__wrapper">
            <div className="team__content-wrapper">
                <div className="team__content">
                    {tabContent[activeTab] || <p>Выберите раздел</p>}
                </div>
            </div>
            <aside className="team__sidebar">
                <div
                    className="team__avatar"
                    style={{ backgroundColor: currentTeam.avatar_color }}
                ></div>
                <div className="team__divider"></div>
                <h2>{currentTeam.name}</h2>
                <ul className="team__sidebar-content">
                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("members")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={UserIcon} alt="user-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>
                            Участники
                        </span>
                    </MyButton>

                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("assignments")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={Assignment} alt="assignment-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>
                            Задания
                        </span>
                    </MyButton>

                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("files")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={File} alt="file-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>Файлы</span>
                    </MyButton>

                    <MyButton
                        className={buttonStyles.teamButton}
                        onClick={() => setActiveTab("posts")}
                    >
                        <span className={buttonStyles.sidebarIcon}>
                            <Icon src={Publication} alt="publication-icon" />
                        </span>
                        <span className={buttonStyles.sidebarInfo}>
                            Публикации
                        </span>
                    </MyButton>
                </ul>
            </aside>
        </div>
    );
};

export { TeamDetailPage };
