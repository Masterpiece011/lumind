"use client";
import React, { useState, useEffect } from "react";
import {
    getAssignmentById,
    updateAssignment,
} from "@/shared/api/assignmentsAPI";
import { FileItem } from "@/shared/ui/FileComp";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import Text from "@/shared/ui/Text";
import "./InstructorAssignmentDetail.scss";
import { StatusSelector } from "../StatusSelector/StatusSelector";

export const InstructorAssignmentDetail = ({ assignmentId }) => {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assessment, setAssessment] = useState("");

    const safeGetAssignmentData = (response) => {
        if (!response || !response.assignment) {
            throw new Error("Неверный формат ответа сервера");
        }

        const assignment = response.assignment;

        return {
            id: assignment.id,
            title: assignment.title || "Без названия",
            description: assignment.description || "Нет описания",
            comment: assignment.comment || "",
            status: assignment.status || "unknown",
            plan_date: assignment.plan_date || new Date(),
            assessment: assignment.assessment || "",

            // Данные задачи
            task_title:
                assignment.task?.title || assignment.title || "Без названия",
            task_description: assignment.task?.description || "Нет описания",

            // Файлы
            task_files: assignment.task_files || assignment.task?.files || [],
            assignment_files:
                assignment.assignment_files || assignment.files || [],

            // Пользователи
            user_name:
                [assignment.user?.first_name, assignment.user?.last_name]
                    .filter(Boolean)
                    .join(" ") || "Неизвестный студент",

            creator_name:
                [assignment.creator?.first_name, assignment.creator?.last_name]
                    .filter(Boolean)
                    .join(" ") || "Неизвестный создатель",
        };
    };

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById(assignmentId);
            const safeData = safeGetAssignmentData(response);
            setAssignment(safeData);
            setAssessment(safeData.assessment);
        } catch (err) {
            console.error("Failed to fetch assignment:", err);
            setError(err.message || "Ошибка загрузки задания");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const handleStatusChange = async (newStatus) => {
        try {
            setLoading(true);
            await updateAssignment({
                assignment_id: assignmentId,
                status: newStatus,
                assessment: assessment,
            });

            // Обновляем только необходимые поля
            setAssignment((prev) => ({
                ...prev,
                status: newStatus,
                assessment: assessment,
            }));
        } catch (err) {
            setError(err.message || "Ошибка при обновлении статуса");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;
    if (!assignment) return <Text tag="p">Задание не найдено</Text>;

    return (
        <div className="instructor-assignment-detail">
            <div className="header">
                <Text tag="h1">{assignment.task_title}</Text>
                <div className="meta">
                    <Text tag="p">Студент: {assignment.user_name}</Text>
                    <Text tag="p">
                        Срок:{" "}
                        {new Date(assignment.plan_date).toLocaleDateString()}
                    </Text>
                    <Text tag="p">Статус: {assignment.status}</Text>
                </div>
            </div>

            <div className="content">
                <div className="description">
                    <Text tag="h2">Описание задания</Text>
                    <Text tag="p">{assignment.task_description}</Text>
                </div>

                <div className="assessment">
                    <div className="assessment-form">
                        <label>Оценка:</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={assessment}
                            onChange={(e) => setAssessment(e.target.value)}
                        />
                    </div>
                    <StatusSelector
                        currentStatus={assignment.status}
                        onStatusChange={handleStatusChange}
                        isLoading={loading}
                    />
                </div>

                <div className="files">
                    <Text tag="h2">Работа студента</Text>
                    {assignment.assignment_files.length > 0 ? (
                        <div className="files-list">
                            {assignment.assignment_files.map((file) => (
                                <FileItem
                                    key={file.id || file.file_url}
                                    fileUrl={file.file_url}
                                />
                            ))}
                        </div>
                    ) : (
                        <Text tag="p">Файлы не прикреплены</Text>
                    )}
                </div>
            </div>
        </div>
    );
};
