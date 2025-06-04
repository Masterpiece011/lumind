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
import { ASSIGNMENTS_STATUSES } from "@/shared/constants/assignments";
import { downloadFile } from "@/shared/api/filesAPI";
import { formatUserName } from "@/shared/lib/utils/formatUserName";
import { useRouter } from "next/navigation";

export const InstructorAssignmentDetail = ({ assignmentId, userId }) => {
    const router = useRouter();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assessment, setAssessment] = useState("");
    const [comment, setComment] = useState("");

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById(assignmentId);

            console.log("Полученные данные:", response);

            if (!response.assignment) {
                throw new Error("Назначение не найдено");
            }

            // Форматируем имя студента
            const formattedStudent = response.assignment.user
                ? {
                      ...response.assignment.user,
                      formattedName: formatUserName(response.assignment.user),
                  }
                : null;

            setAssignment({
                ...response.assignment,
                user: formattedStudent,
                creator: response.assignment.creator || {
                    id: response.assignment.creator_id,
                    first_name: "",
                    last_name: "",
                    middle_name: "",
                    email: "",
                },
                plan_date: response.assignment.plan_date, // Убедимся, что дата передается
            });

            // Устанавливаем текущие значения оценки и комментария
            setAssessment(response.assignment.assessment || "");
            setComment(response.assignment.comment || "");
        } catch (err) {
            console.error("Ошибка загрузки:", err);
            setError(err.message || "Ошибка загрузки задания");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (assignmentId) {
            // Добавляем проверку на наличие assignmentId
            fetchAssignment();
        }
    }, [assignmentId]);

    const handleStatusChange = async (newStatus) => {
        try {
            setLoading(true);
            const response = await updateAssignment({
                assignment_id: assignmentId,
                status: newStatus,
                assessment: assessment,
                comment: comment,
            });
            setAssignment(response.assignment);
        } catch (err) {
            setError(err.message || "Ошибка при обновлении статуса");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            await downloadFile({ fileId, fileName });
        } catch (err) {
            setError("Ошибка скачивания файла: " + err.message);
        }
    };

    const getStatusText = () => {
        if (!assignment) return "";
        switch (assignment.status) {
            case ASSIGNMENTS_STATUSES.ASSIGNED:
                return "Назначено";
            case ASSIGNMENTS_STATUSES.SUBMITTED:
                return "Сдано на проверку";
            case ASSIGNMENTS_STATUSES.IN_PROGRES:
                return "В работе";
            case ASSIGNMENTS_STATUSES.COMPLETED:
                return "Выполнено";
            case ASSIGNMENTS_STATUSES.FAILED:
                return "Провалено";
            default:
                return assignment.status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Не указан";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "Неверная дата";
        }
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;
    if (!assignment) return <Text tag="p">Задание не найдено</Text>;

    return (
        <div className="instructor-assignment-detail">
            <div className="header">
                <Text tag="h1">{assignment.task?.title || "Без названия"}</Text>
                <div className="meta">
                    <Text tag="p">
                        Студент:{" "}
                        {assignment.user?.formattedName ||
                            "Неизвестный студент"}
                    </Text>
                    <Text tag="p">
                        Срок: {formatDate(assignment.plan_date)}
                    </Text>

                    <Text tag="p">Статус: {getStatusText()}</Text>
                    {assignment.assessment && (
                        <Text tag="p">Оценка: {assignment.assessment}</Text>
                    )}
                </div>
            </div>

            <div className="content">
                <div className="section">
                    <Text tag="h2">Описание задания</Text>
                    <Text tag="p">
                        {assignment.task?.description || "Нет описания"}
                    </Text>
                </div>

                {assignment.task?.comment && (
                    <div className="section">
                        <Text tag="h2">Комментарий к заданию</Text>
                        <Text tag="p">{assignment.task.comment}</Text>
                    </div>
                )}

                {assignment.task?.files?.length > 0 && (
                    <div className="section">
                        <Text tag="h2">Файлы задания</Text>
                        <div className="files-list">
                            {assignment.task.files.map((file) => (
                                <FileItem
                                    key={file.id}
                                    fileUrl={file.file_url}
                                    fileName={file.original_name}
                                    onDownload={() =>
                                        handleDownloadFile(
                                            file.id,
                                            file.original_name,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="section">
                    <Text tag="h2">Работа студента</Text>

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

                    <div className="comment-section">
                        <label>Комментарий:</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <StatusSelector
                        currentStatus={assignment.status}
                        onStatusChange={handleStatusChange}
                        isLoading={loading}
                    />

                    {assignment.files?.length > 0 ? (
                        <div className="files-list">
                            {assignment.files.map((file) => (
                                <FileItem
                                    key={file.id}
                                    fileUrl={file.file_url}
                                    fileName={file.original_name}
                                    onDownload={() =>
                                        handleDownloadFile(
                                            file.id,
                                            file.original_name,
                                        )
                                    }
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
