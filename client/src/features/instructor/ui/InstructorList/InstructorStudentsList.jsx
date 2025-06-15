"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import Text from "@/shared/ui/Text";
import "./InstructorStudentsList.scss";
import { getStudentsWithAssignments } from "@/shared/api/assignmentsAPI";
import { formatUserName } from "@/shared/lib/utils/formatUserName";
import { useRouter } from "next/navigation";
import { TeamFilter } from "../TeamFilter/TeamFilter";

const getStatusText = (status) => {
    const statusMap = {
        assigned: "Назначено",
        submitted: "На проверке",
        completed: "Завершено",
        failed: "Возвращено",
        not_assigned: "Не назначено",
        in_progress: "В работе",
    };
    return statusMap[status] || status;
};

export const InstructorStudentsList = ({ onSelectAssignment, taskId }) => {
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    const { loading: teamsLoading } = useSelector((state) => ({
        loading: state.teams.loading,
    }));

    const fetchStudents = useCallback(
        async (teamId = null, page = 1) => {
            try {
                const response = await getStudentsWithAssignments(
                    taskId,
                    teamId,
                    page,
                );

                if (taskId && response?.task?.title) {
                    setTaskTitle(response.task.title);
                } else {
                    setTaskTitle("");
                }

                return {
                    students: response.students,
                    teams: response.students.flatMap(
                        (student) => student.teams || [],
                    ),
                    taskTitle: response?.task?.title || "",
                    pagination: {
                        page: response.currentPage,
                        total: response.total,
                        totalPages: response.totalPages,
                    },
                };
            } catch (err) {
                console.error("Fetch error:", err);
                throw err;
            }
        },
        [taskId],
    );

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [initialData, allTeamsData] = await Promise.all([
                fetchStudents(),
                fetchStudents(null, 1),
            ]);

            const uniqueTeams = Array.from(
                new Map(
                    allTeamsData.teams.map((team) => [team.id, team]),
                ).values(),
            );

            setAllTeams(uniqueTeams);
            setStudents(initialData.students);
            if (initialData.taskTitle) {
                setTaskTitle(initialData.taskTitle);
            }
        } catch (err) {
            setError(err.message || "Ошибка загрузки данных");
        } finally {
            setIsLoading(false);
        }
    }, [fetchStudents]);

    const handleTeamChange = useCallback(
        async (teamId) => {
            try {
                setIsFilterLoading(true);
                setSelectedTeam(teamId);

                const { students, taskTitle: newTaskTitle } =
                    await fetchStudents(teamId);
                setStudents(students);
                if (newTaskTitle) {
                    setTaskTitle(newTaskTitle);
                }
            } catch (err) {
                setError(err.message || "Ошибка фильтрации");
            } finally {
                setIsFilterLoading(false);
            }
        },
        [fetchStudents],
    );

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleSelectUser = (userId, assignment) => {
        if (onSelectAssignment) {
            onSelectAssignment(assignment);
        } else if (assignment?.id) {
            router.push(
                `/assignments/students-assignments/${assignment.id}${taskId ? `?taskId=${taskId}` : ""}`,
            );
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            assigned: "status--assigned",
            submitted: "status--submitted",
            completed: "status--completed",
            failed: "status--failed",
            in_progress: "status--in-progress",
            not_assigned: "status--not-assigned",
        };

        return (
            <span className={`status-badge ${statusClasses[status] || ""}`}>
                {getStatusText(status)}
            </span>
        );
    };

    const filteredStudents = useMemo(() => {
        return students.filter((student) => student.assignments.length > 0);
    }, [students]);

    if (isLoading || teamsLoading) {
        return <ClockLoader />;
    }

    if (error) {
        return <Text className="error-message">{error}</Text>;
    }

    return (
        <div className="instructor-students">
            <Text tag="h2" className="instructor-students__title">
                {taskId ? `Назначения` : `Все студенты с назначениями`}
            </Text>

            <TeamFilter
                teams={allTeams}
                currentTeam={selectedTeam}
                onTeamChange={handleTeamChange}
                taskTitle={taskTitle}
                isLoading={isFilterLoading}
            />

            <div className="instructor-students__students-list">
                {isFilterLoading ? (
                    <div className="instructor-students__loading">
                        <ClockLoader size={24} />
                    </div>
                ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                        const assignment = student.assignments[0];
                        const status = assignment?.status || "not_assigned";
                        const firstTeam = student.teams?.[0];
                        const teamName = firstTeam?.name || "Без команды";
                        const groupName = student.group?.title || "Без группы";

                        return (
                            <div
                                key={student.id}
                                className={`instructor-students__student-item ${
                                    selectedUserId === student.id
                                        ? "instructor-students__student-item--active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleSelectUser(student.id, assignment)
                                }
                            >
                                <div className="student-info">
                                    <Text tag="p" className="student-name">
                                        {formatUserName(student)}
                                    </Text>
                                    <div className="student-meta">
                                        <Text
                                            tag="span"
                                            className="student-group"
                                        >
                                            {groupName}
                                        </Text>
                                        <Text
                                            tag="span"
                                            className="student-team"
                                        >
                                            {teamName}
                                        </Text>
                                    </div>
                                </div>
                                {getStatusBadge(status)}
                            </div>
                        );
                    })
                ) : (
                    <Text tag="p" className="instructor-students__empty">
                        {taskId
                            ? "Нет студентов с назначением по этому заданию"
                            : "Нет студентов с назначениями"}
                    </Text>
                )}
            </div>
        </div>
    );
};
