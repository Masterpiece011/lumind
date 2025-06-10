"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
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
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 1,
    });

    const { loading: teamsLoading } = useSelector((state) => ({
        loading: state.teams.loading,
    }));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getStudentsWithAssignments(
                    taskId,
                    selectedTeam,
                    pagination.page,
                );

                const allUniqueTeams = new Map();
                const filteredUniqueTeams = new Map();

                if (!selectedTeam && allTeams.length === 0) {
                    const allResponse = await getStudentsWithAssignments(
                        taskId,
                        null,
                        1,
                    );
                    allResponse.students.forEach((student) => {
                        student.teams?.forEach((team) => {
                            if (!allUniqueTeams.has(team.id)) {
                                allUniqueTeams.set(team.id, team);
                            }
                        });
                    });
                    setAllTeams(Array.from(allUniqueTeams.values()));
                }

                response.students.forEach((student) => {
                    student.teams?.forEach((team) => {
                        if (!filteredUniqueTeams.has(team.id)) {
                            filteredUniqueTeams.set(team.id, team);
                        }
                    });
                });

                setFilteredTeams(Array.from(filteredUniqueTeams.values()));
                setStudents(response.students);
                setPagination({
                    page: response.currentPage,
                    total: response.total,
                    totalPages: response.totalPages,
                });
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "Ошибка загрузки данных");
                setStudents([]);
                setFilteredTeams([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [taskId, selectedTeam, pagination.page]);

    const handleTeamChange = useCallback((teamId) => {
        setSelectedTeam(teamId);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

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

    if (loading || teamsLoading) return <ClockLoader />;
    if (error) return <Text className="error-message">{error}</Text>;

    return (
        <div className="instructor-students">
            <Text tag="h2" className="instructor-students__title">
                {taskId ? `Назначения` : `Все студенты с назначениями`}
            </Text>

            <TeamFilter
                teams={allTeams}
                currentTeam={selectedTeam}
                onTeamChange={handleTeamChange}
            />

            <div className="instructor-students__students-list">
                {students.length > 0 ? (
                    students
                        .filter((student) => student.assignments.length > 0)
                        .map((student) => {
                            const assignment = student.assignments[0];
                            const status = assignment?.status || "not_assigned";

                            const firstTeam = student.teams?.[0];
                            const teamName = firstTeam?.name || "Без команды";
                            const groupName =
                                student.group?.title || "Без группы";

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
                                    {taskId && (
                                        <div className="assignment-task">
                                            Задание: {assignment.task.title}
                                        </div>
                                    )}
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
