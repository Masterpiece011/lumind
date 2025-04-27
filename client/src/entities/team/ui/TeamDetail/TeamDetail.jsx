import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getTeamById } from "@/shared/api/teamAPI";
import "./TeamDetail.scss";
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
    const { currentTeam, loading, error } = useSelector((state) => state.teams);
    const user_id = useSelector((state) => state.user.user?.id);

    const [activeTab, setActiveTab] = useState("members");
    const [assignmentFilter, setAssignmentFilter] = useState("all");

    useEffect(() => {
        if (id && user_id) {
            dispatch(getTeamById({ teamId: id, userId: user_id }));
        }
    }, [id, user_id, dispatch]);

    const teamAssignments = useMemo(() => {
        if (!currentTeam?.tasks) return [];
        return currentTeam.tasks.flatMap(
            (task) =>
                task.assignments?.map((assignment) => ({
                    ...assignment,
                    task: {
                        id: task.id,
                        title: task.title,
                        files: task.files || [],
                    },
                    teams: [{ id: currentTeam.id, name: currentTeam.name }],
                })) || [],
        );
    }, [currentTeam]);

    const filteredAssignments = useMemo(() => {
        const now = new Date();
        return teamAssignments.filter((assignment) => {
            const dueDate = new Date(assignment.due_date);
            const isOverdue = dueDate < now;
            const hasSubmission = assignment.submission != null;

            switch (assignmentFilter) {
                case "current":
                    return !hasSubmission && !isOverdue;
                case "completed":
                    return hasSubmission;
                case "overdue":
                    return !hasSubmission && isOverdue;
                default:
                    return true;
            }
        });
    }, [teamAssignments, assignmentFilter]);

    const allFiles = useMemo(() => {
        const taskFiles =
            currentTeam?.tasks?.flatMap((task) =>
                (task.files || []).map((file) => ({
                    ...file,
                    taskTitle: task.title,
                    taskId: task.id,
                })),
            ) || [];

        const assignmentFiles =
            currentTeam?.tasks?.flatMap(
                (task) =>
                    task.assignments?.flatMap((assignment) =>
                        (assignment.files || []).map((file) => ({
                            ...file,
                            assignmentTitle: assignment.title,
                            assignmentId: assignment.id,
                        })),
                    ) || [],
            ) || [];

        return [...taskFiles, ...assignmentFiles];
    }, [currentTeam]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    const handleFilterChange = useCallback((filter) => {
        setAssignmentFilter(filter);
    }, []);

    const renderAssignmentCard = (assignment) => {
        const dueDate = new Date(assignment.due_date);
        const isOverdue = dueDate < new Date();
        const isCompleted = assignment.status === "completed";

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
                    {isCompleted && isOverdue && (
                        <div className="assignments__status assignments__status--overdue">
                            Сдано с опозданием
                        </div>
                    )}
                    {isCompleted && !isOverdue && (
                        <div className="assignments__status assignments__status--completed">
                            Выполнено
                        </div>
                    )}
                </div>
                <h2 className="assignments__name">{assignment.title}</h2>
                <p className="assignments__description">
                    {assignment.description}
                </p>
                <div className="assignments__deadline">
                    Срок: {dueDate.toLocaleDateString()}
                </div>
                {assignment.task && (
                    <div className="assignments__task">
                        Задача: {assignment.task.title}
                    </div>
                )}
            </div>
        );
    };

    const tabContent = {
        members: (
            <div className="team__tab-content">
                <h3 className="team__tab-title">Участники команды</h3>
                <ul className="team__members-list">
                    {currentTeam?.users?.map((user) => (
                        <li className="team__member" key={user.id}>
                            <div className="team__member-info">
                                <span className="team__member-name">
                                    {user.first_name ||
                                        user.email.split("@")[0]}
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
                                onClick={() => setAssignmentFilter(filterType)}
                            >
                                {
                                    {
                                        all: "Все задания",
                                        current: "Текущие",
                                        completed: "Выполненные",
                                        overdue: "Просроченные",
                                    }[filterType]
                                }
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
                                    file.assignmentTitle ||
                                    file.taskTitle ||
                                    "Файл команды"
                                }
                                onClick={() => {
                                    if (file.assignmentId) {
                                        onSelectAssignment(file.assignmentId);
                                    } else if (file.taskId) {
                                        // Действие по taskId
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p>Нет файлов</p>
                )}
            </div>
        ),
        posts: (
            <div className="team-posts">
                <p>Публикации команды</p>
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
                <p className="team__description">{currentTeam.description}</p>

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
