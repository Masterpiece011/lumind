"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getTeamById, getTeamFiles } from "@/app/api/teamAPI";
import { getAssignments } from "@/app/api/assignmentsAPI";
import "../TeamDetail.scss";
import * as buttonStyles from "@/app/components/uikit/MyButton/MyButton.module.scss";
import { MyButton } from "@/app/components/uikit";
import { Icon } from "@/app/components/ui/icons";
import UserIcon from "@/app/assets/icons/user-icon.png";
import Assignment from "@/app/assets/icons/assignments-icon.svg";
import File from "@/app/assets/icons/file-icon.svg";
import Publication from "@/app/assets/icons/publication-icon.svg";
import { FileItem } from "@/app/components/FileComp";
import { useDispatch, useSelector } from "react-redux";

const TeamDetailPage = ({ onSelectAssignment }) => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { currentTeam, loading, error } = useSelector((state) => state.teams);
    const user_id = useSelector((state) => state.user.user?.id);
    const assignmentsData = useSelector((state) => state.assignments);
    const { teamFiles = [] } = useSelector((state) => state.teams);

    const [activeTab, setActiveTab] = useState("posts");
    const [assignmentFilter, setAssignmentFilter] = useState("all");

    useEffect(() => {
        if (id && user_id) {
            dispatch(getTeamById({ teamId: id, userId: user_id }));
        }
    }, [id, user_id, dispatch]);

    useEffect(() => {
        if (activeTab === "assignments" && currentTeam && user_id) {
            dispatch(getAssignments({ userId: user_id, filter: "all" }));
        }
    }, [activeTab, currentTeam, user_id, dispatch]);

    useEffect(() => {
        if (activeTab === "files" && currentTeam && user_id) {
            dispatch(getTeamFiles(currentTeam.id));
        }
    }, [activeTab, currentTeam, user_id, dispatch]);

    const filteredAssignments = useMemo(() => {
        if (!Array.isArray(assignmentsData.assignments)) return [];

        const now = new Date();
        return assignmentsData.assignments
            .filter((assignment) =>
                assignment.teams?.some((team) => team.id === currentTeam?.id),
            )
            .filter((assignment) => {
                const dueDate = new Date(assignment.due_date);
                const hasSubmission =
                    assignment.submission !== null &&
                    assignment.submission !== undefined;

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
    }, [assignmentsData.assignments, currentTeam?.id, assignmentFilter]);

    const assignmentFiles = useMemo(() => {
        return filteredAssignments.flatMap(
            (assignment) =>
                assignment.assignments_investments?.map((file) => ({
                    ...file,
                    assignmentTitle: assignment.title,
                    assignmentId: assignment.id,
                })) || [],
        );
    }, [filteredAssignments]);

    const allFiles = [...teamFiles, ...assignmentFiles];

    const renderAssignmentCard = (assignment) => {
        const dueDate = new Date(assignment.due_date);
        const now = new Date();
        const isOverdue = dueDate < now;
        const hasSubmission =
            assignment.submission !== null &&
            assignment.submission !== undefined;

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
            <ul>
                {currentTeam?.users?.map((user) => (
                    <li key={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                    </li>
                )) || <p>Нет участников</p>}
            </ul>
        ),
        assignments: (
            <div className="team__tab-content">
                <h3 className="team__tab-title">Задания команды</h3>

                <div className="assignments__filters">
                    {["all", "current", "completed", "overdue"].map(
                        (filterType) => {
                            const labels = {
                                all: "Все задания",
                                current: "Текущие",
                                completed: "Выполненные",
                                overdue: "Просроченные",
                            };
                            return (
                                <MyButton
                                    key={filterType}
                                    className={`assignments__filter-button ${
                                        assignmentFilter === filterType
                                            ? "assignments__filter-button--active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setAssignmentFilter(filterType)
                                    }
                                >
                                    {labels[filterType]}
                                </MyButton>
                            );
                        },
                    )}
                </div>

                <div className="assignments__card-wrapper">
                    {assignmentsData.loading ? (
                        <div className="assignments__loading">Загрузка...</div>
                    ) : assignmentsData.error ? (
                        <div className="assignments__error">
                            Ошибка: {assignmentsData.error}
                        </div>
                    ) : filteredAssignments.length > 0 ? (
                        filteredAssignments.map(renderAssignmentCard)
                    ) : (
                        <p className="assignments__empty">
                            Нет заданий для этой команды
                        </p>
                    )}
                </div>
            </div>
        ),
        groups: (
            <ul>
                {currentTeam?.groups?.map((group) => (
                    <li key={group.id}>
                        {group.title} ({group.users.length} участников)
                        <ul>
                            {group.users.map((user) => (
                                <li key={user.id}>
                                    {user.first_name} {user.last_name} (
                                    {user.email})
                                </li>
                            ))}
                        </ul>
                    </li>
                )) || <p>Нет групп</p>}
            </ul>
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
                                    file.assignmentTitle
                                        ? `${file.assignmentTitle}`
                                        : "Файл команды"
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

    if (loading) return <div>Загрузка...</div>;
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

export default TeamDetailPage;
