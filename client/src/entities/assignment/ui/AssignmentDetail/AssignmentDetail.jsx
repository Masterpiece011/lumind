"use client";

import "./AssignmentDetail.scss";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { getAssignmentById } from "@/shared/api/assignmentsAPI";

import { MyButton } from "@/shared/uikit/MyButton";
import { FileItem } from "@/shared/ui/FileComp";
import { SubmissionForm } from "@/features/submissions/ui/Submissions/SubmissionsForm";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

import { ASSIGNMENTS_STATUSES } from "@/shared/constants/assignments";
import Text from "@/shared/ui/Text";

const AssignmentDetailPage = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const workFormRef = useRef(null);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById({ assignmentId: id });
            setAssignment(response.assignment);
            setError(null);
            setLoading(false);
        } catch (err) {
            setError(err.message || "Ошибка загрузки назначения");
            setAssignment(null);
        }
    };

    useEffect(() => {
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
            case ASSIGNMENTS_STATUSES.ASSIGNED:
                return "Назначено";
            case ASSIGNMENTS_STATUSES.SUBMITTED:
                return "Сдано на проверку";
            case ASSIGNMENTS_STATUSES.IN_PROGRES:
                return "В работе";
            case ASSIGNMENTS_STATUSES.SUBMITTED:
                return "Выполнено";
            case ASSIGNMENTS_STATUSES.FAILED:
                return "Провалено";
            default:
                return "";
        }
    };

    const getSubmitButtonText = () => {
        switch (assignment.status) {
            case ASSIGNMENTS_STATUSES.COMPLETED:
            case ASSIGNMENTS_STATUSES.SUBMITTED:
            case ASSIGNMENTS_STATUSES.FAILED:
                return "Отменить сдачу";
            default:
                return "Сдать работу";
        }
    };

    if (loading) return <ClockLoader />;

    if (error) return <Text tag="p">Ошибка: {error}</Text>;

    if (!assignment) return <Text tag="p">Задание не найдено</Text>;

    return (
        <div className="assignment-detail">
            <div className="assignment-detail__header">
                <div className="assignment-detail__header-left">
                    <Text
                        tag="h1"
                        className={"assignment-detail__header-left-title"}
                    >
                        {assignment.task.title}
                    </Text>
                </div>

                <div className="assignment-detail__header-right">
                    <Text
                        tag="span"
                        className="assignment-detail__header-left-term"
                    >
                        Срок:{" "}
                        {new Date(assignment.plan_date).toLocaleDateString()}
                    </Text>

                    <Text tag="p">Статус: {getStatusText()}</Text>

                    {assignment.assessment && (
                        <Text tag="p" className="score">
                            Оценка: {assignment.assessment}
                        </Text>
                    )}

                    <MyButton
                        className={`assignment-detail__submit-btn ${
                            isActive
                                ? "assignment-detail__submit-btn--active"
                                : ""
                        }`}
                        text={getSubmitButtonText()}
                        onClick={handleSubmitWork}
                    />
                </div>
            </div>

            <div className="assignment-detail__body">
                <div className="assignment-detail__info">
                    <section>
                        <Text
                            tag="h2"
                            className={"assignment-detail__info-caption"}
                        >
                            Преподаватель:
                        </Text>
                        <Text tag="p">
                            {assignment.creator?.last_name}{" "}
                            {assignment.creator?.first_name}{" "}
                            {assignment.creator?.middle_name}
                        </Text>
                    </section>

                    <section>
                        <Text
                            tag="h2"
                            className="assignment-detail__info-caption"
                        >
                            Описание задания:
                        </Text>
                        <Text tag="p">
                            {assignment.task.description || "Нет описания"}
                        </Text>
                    </section>

                    {assignment.comment && (
                        <section>
                            <Text
                                tag="h2"
                                className="assignment-detail__info-caption"
                            >
                                Комментарий к заданию:
                            </Text>
                            <Text tag="p" className="description">
                                {assignment.task.comment}
                            </Text>
                        </section>
                    )}

                    {assignment.task_files?.length !== 0 && (
                        <section>
                            <Text
                                tag="h2"
                                className="assignment-detail__info-caption"
                            >
                                Файлы задания:
                            </Text>
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
                        <Text tag="h2">Моя работа</Text>
                    </div>

                    <SubmissionForm
                        ref={workFormRef}
                        assignment_id={id}
                        initialFiles={assignment.user_files}
                        onSubmit={handleSubmitWork}
                    />

                    <section>
                        <Text tag="h3" className="files-title">
                            Прикреплённые файлы:{" "}
                        </Text>
                        {assignment.assignment_files?.length > 0 ? (
                            <ul className="files-list">
                                {assignment.assignment_files.map((file) => (
                                    <li key={file.id}>
                                        <FileItem fileUrl={file.file_url} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Text tag="p">Вы ещё не прикрепили файлы</Text>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export { AssignmentDetailPage };
