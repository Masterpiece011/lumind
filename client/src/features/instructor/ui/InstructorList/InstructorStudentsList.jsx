"use client";

import React, { useState, useEffect } from "react";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import Text from "@/shared/ui/Text";
import "./InstructorStudentsList.scss";
import { getStudentsWithAssignments } from "@/shared/api/assignmentsAPI";
import { formatUserName } from "@/shared/lib/utils/formatUserName";

export const InstructorStudentsList = ({ taskId, onSelectUser }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getStudentsWithAssignments(taskId);

                if (!response?.students) {
                    throw new Error("Неверный формат данных");
                }

                setStudents(response.students);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "Ошибка загрузки данных");
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [taskId]);

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        if (onSelectUser) onSelectUser(userId);
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

    if (loading) return <ClockLoader />;
    if (error) return <Text className="error-message">{error}</Text>;

    return (
        <div className="instructor-students">
            <Text tag="h2" className="instructor-students__title">
                {taskId
                    ? "Студенты с этим заданием"
                    : "Студенты с назначениями"}
            </Text>

            <div className="instructor-students__students-list">
                {students.length > 0 ? (
                    students.map((student) => {
                        const firstAssignment = student.assignments[0];
                        const status =
                            firstAssignment?.status || "not_assigned";

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
                                onClick={() => handleSelectUser(student.id)}
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
                            ? "Нет студентов с этим заданием"
                            : "Нет студентов с назначениями"}
                    </Text>
                )}
            </div>
        </div>
    );
};

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
