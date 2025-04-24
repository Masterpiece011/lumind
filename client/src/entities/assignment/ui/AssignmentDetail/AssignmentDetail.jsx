"use client";

import "./AssignmentDetail.scss";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { getAssignmentById } from "@/shared/api/assignmentsAPI";

import { MyButton } from "@/shared/uikit/MyButton";
import { FileItem } from "@/shared/ui/FileComp";
import { SubmissionForm } from "@/features/submissions/ui/Submissions/SubmissionsForm";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

const AssignmentDetailPage = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [showWorkForm, setShowWorkForm] = useState(true);
    const workFormRef = useRef(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                setLoading(true);
                const response = await getAssignmentById({ assignmentId: id });
                setAssignment(response.assignment);
                setError(null);
            } catch (err) {
                setError(err.message || "Ошибка загрузки задания");
                setAssignment(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAssignment();
        }
    }, [id]);

    const isActive = false;

    const handleSubmitWork = async (files) => {
        try {
            // Здесь должна быть логика отправки файлов на сервер
            // После успешной отправки обновляем состояние
            setAssignment((prev) => ({
                ...prev,
                status: "completed", // Меняем статус на "завершено"
                user_files: files,
            }));

            setShowWorkForm(false);
        } catch (err) {
            setError("Ошибка при отправке работы");
        }
    };

    const getStatusText = () => {
        if (!assignment) return "";

        switch (assignment.status) {
            case "assigned":
                return "Назначено";
            case "submitted":
                return "Сдано на проверку";
            case "in_progress":
                return "В работе";
            case "completed":
                return "Выполнено";
            case "failed":
                return "Провалено";
            default:
                return "";
        }
    };

    if (loading) return <ClockLoader />;

    if (error) return <div>Ошибка: {error}</div>;

    if (!assignment) return <div>Задание не найдено</div>;

    console.log(assignment);

    return (
        <div className="assignment-detail">
            <div className="assignment-detail__header">
                <div className="assignment-detail__header-left">
                    <h1 className="assignment-detail__header-left-title">
                        {assignment.task.title}
                    </h1>
                </div>

                <div className="assignment-detail__header-right">
                    <div className="meta">
                        <span className="assignment-detail__header-left-term">
                            Срок:{" "}
                            {new Date(
                                assignment.plan_date,
                            ).toLocaleDateString()}
                        </span>
                        <span>Статус: {getStatusText()}</span>
                    </div>

                    {assignment.assessment && (
                        <div className="score">
                            Оценка: {assignment.assessment}
                        </div>
                    )}

                    <MyButton
                        className={`assignment-detail__submit-btn ${
                            isActive
                                ? "assignment-detail__submit-btn--active"
                                : ""
                        }`}
                        text={"Сдать работу"}
                        onClick={handleSubmitWork}
                    />
                </div>
            </div>

            <div className="assignment-detail__body">
                <div className="assignment-detail__info">
                    <section>
                        <h2 className="assignment-detail__info-caption">
                            Преподаватель:{" "}
                        </h2>
                        <p>
                            {assignment.creator?.first_name}{" "}
                            {assignment.creator?.last_name}
                            {assignment.creator?.email &&
                                ` (${assignment.creator.email})`}
                        </p>
                    </section>

                    <section>
                        <h2 className="assignment-detail__info-caption">
                            Описание задания:{" "}
                        </h2>
                        <p>{assignment.task.description || "Нет описания"}</p>
                    </section>

                    {assignment.comment && (
                        <section>
                            <h2 className="assignment-detail__info-caption">
                                Комментарий к заданию:{" "}
                            </h2>
                            <p className="description">
                                {assignment.task.comment}
                            </p>
                        </section>
                    )}

                    {assignment.task_files?.length !== 0 && (
                        <section>
                            <h2 className="assignment-detail__info-caption">
                                Файлы задания:{" "}
                            </h2>
                            <ul className="files-list">
                                {assignment.task_files.map((file) => (
                                    <li key={file.id}>
                                        <FileItem fileUrl={file.file_url} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="assignment-detail__work">
                    <div className="work-header">
                        <h2>Моя работа</h2>
                    </div>

                    <SubmissionForm
                        ref={workFormRef}
                        assignment_id={id}
                        initialFiles={assignment.user_files}
                        onSubmit={handleSubmitWork}
                    />

                    <section>
                        <h3 className="files-title">Прикреплённые файлы: </h3>
                        {assignment.assignment_files?.length > 0 ? (
                            <ul className="files-list">
                                {assignment.assignment_files.map((file) => (
                                    <li key={file.id}>
                                        <FileItem fileUrl={file.file_url} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Вы ещё не прикрепили файлы</p>
                        )}
                    </section>

                    {assignment.status === "completed" && (
                        <div className="status-notice">
                            Работа отправлена на проверку
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { AssignmentDetailPage };
