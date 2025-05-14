"use client";
import React, { useState, useEffect } from "react";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import Text from "@/shared/ui/Text";
import "./InstructorStudentsList.scss";
import { getUsersWithTask } from "@/shared/api/assignmentsAPI";

export const InstructorStudentsList = ({ taskId, onSelectUser }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        if (!taskId) {
            setError("ID задания не указан");
            setLoading(false);
            return;
        }

        const fetchStudents = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getUsersWithTask(taskId);

                if (!response || !response.students) {
                    throw new Error("Неверный формат данных студентов");
                }

                setStudents(response.students);
            } catch (err) {
                console.error("Fetch students error:", err);
                setError(err.message || "Ошибка загрузки студентов");
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [taskId]);

    const handleSelectUser = (userId, assignmentId) => {
        console.log("User selected:", userId, "assignment:", assignmentId);
        setSelectedUserId(userId);
        if (onSelectUser) {
            onSelectUser(userId, assignmentId);
        }
    };

    console.log("Rendering InstructorStudentsList", {
        loading,
        error,
        studentsCount: students.length,
        selectedUserId,
    });

    if (loading) {
        console.log("Rendering loader");
        return <ClockLoader />;
    }

    if (error) {
        console.log("Rendering error:", error);
        return (
            <Text tag="p" className="error-message">
                Ошибка: {error}
            </Text>
        );
    }

    return (
        <div className="instructor-students">
            <Text tag="h2">Студенты команды с этим заданием</Text>
            <div className="students-list">
                {students.length > 0 ? (
                    students.map((student) => {
                        console.log("Rendering student:", student.id);
                        return (
                            <div
                                key={student.id}
                                className={`student-item ${
                                    selectedUserId === student.id
                                        ? "active"
                                        : ""
                                } ${student.status}`}
                                onClick={() =>
                                    handleSelectUser(
                                        student.id,
                                        student.assignment_id,
                                    )
                                }
                            >
                                <Text tag="p">
                                    {student.first_name} {student.last_name}
                                    {student.email && (
                                        <span className="email">
                                            {" "}
                                            ({student.email})
                                        </span>
                                    )}
                                </Text>
                                <Text
                                    tag="span"
                                    className={`status ${student.status}`}
                                >
                                    {getStatusText(student.status)}
                                </Text>
                            </div>
                        );
                    })
                ) : (
                    <Text tag="p">Нет студентов в команде с этим заданием</Text>
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
