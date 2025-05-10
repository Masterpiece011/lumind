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
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const response = await getUsersWithTask(taskId);
                setStudents(response.students || []);
            } catch (err) {
                setError(err.message || "Ошибка загрузки студентов");
            } finally {
                setLoading(false);
            }
        };

        if (taskId) fetchStudents();
    }, [taskId]);

    const handleSelectUser = (userId, assignmentId) => {
        setSelectedUserId(userId);
        onSelectUser(userId, assignmentId);
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;

    return (
        <div className="instructor-students">
            <Text tag="h2">Студенты команды с этим заданием</Text>
            <div className="students-list">
                {students.length > 0 ? (
                    students.map((student) => (
                        <div
                            key={student.id}
                            className={`student-item ${
                                selectedUserId === student.id ? "active" : ""
                            }`}
                            onClick={() =>
                                handleSelectUser(
                                    student.id,
                                    student.assignment_id,
                                )
                            }
                        >
                            <Text tag="p">
                                {student.first_name} {student.last_name}
                            </Text>
                            <Text tag="span" className="status">
                                {getStatusText(student.status)}
                            </Text>
                        </div>
                    ))
                ) : (
                    <Text tag="p">Нет студентов в команде с этим заданием</Text>
                )}
            </div>
        </div>
    );
};

const getStatusText = (status) => {
    switch (status) {
        case "assigned":
            return "Назначено";
        case "submitted":
            return "На проверке";
        case "completed":
            return "Завершено";
        case "failed":
            return "Возвращено";
        case "not_assigned":
            return "Не назначено";
        default:
            return status;
    }
};
