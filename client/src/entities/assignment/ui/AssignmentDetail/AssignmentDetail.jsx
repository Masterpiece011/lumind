"use client";

import "./AssignmentDetail.scss";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import {
    getAssignmentById,
    updateAssignment,
} from "@/shared/api/assignmentsAPI";

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
    const [showWorkForm, setShowWorkForm] = useState(false);
    const workFormRef = useRef(null);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById({ assignmentId: id });
            setAssignment(response.assignment);
            setError(null);
        } catch (err) {
            setError(err.message || "Ошибка загрузки назначения");
            setAssignment(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAssignment();
        }
    }, [id]);

    const handleSubmitWork = async (updatedAssignment) => {
        try {
            const currentTaskData = assignment.task;
            const currentCreatorData = assignment.creator;

            setAssignment({
                ...updatedAssignment,
                task: currentTaskData,
                creator: currentCreatorData,
                assignment_files: updatedAssignment.assignment_files || [],
                task_files: assignment.task_files || [],
            });

            setShowWorkForm(false);
            await fetchAssignment();
        } catch (err) {
            setError("Ошибка при отправке работы");
        }
    };

    const handleCancelSubmission = async () => {
        try {
            setLoading(true);
            const response = await updateAssignment({
                assignment_id: id,
                status: ASSIGNMENTS_STATUSES.ASSIGNED,
                comment: "",
                investments: [],
            });

            setAssignment({
                ...response.assignment,
                task: assignment.task,
                creator: assignment.creator,
                assignment_files: [],
                task_files: assignment.task_files || [],
            });

            setShowWorkForm(false);
        } catch (err) {
            console.error("Ошибка отмены отправки:", err);
            setError(
                err.response?.data?.message || "Ошибка при отмене отправки",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitClick = async () => {
        // Если задание уже отправлено - отменяем отправку
        if (
            assignment?.status === ASSIGNMENTS_STATUSES.SUBMITTED ||
            assignment?.status === ASSIGNMENTS_STATUSES.COMPLETED
        ) {
            await handleCancelSubmission();
            return;
        }

        // Просто открываем/закрываем форму без отправки
        setShowWorkForm(!showWorkForm);
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

    const getSubmitButtonText = () => {
        if (!assignment) return "Загрузка...";

        switch (assignment.status) {
            case ASSIGNMENTS_STATUSES.COMPLETED:
            case ASSIGNMENTS_STATUSES.SUBMITTED:
                return "Отменить сдачу";
            default:
                return showWorkForm ? "Закрыть форму" : "Сдать работу";
        }
    };

    const isSubmitButtonActive =
        assignment?.status === ASSIGNMENTS_STATUSES.ASSIGNED ||
        assignment?.status === ASSIGNMENTS_STATUSES.IN_PROGRES ||
        showWorkForm ||
        assignment?.status === ASSIGNMENTS_STATUSES.SUBMITTED;

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;
    if (!assignment) return <Text tag="p">Задание не найдено</Text>;

    return (
        <div className="assignment-detail">
            <div className="assignment-detail__header">
                <div className="assignment-detail__header-left">
                    <Text
                        tag="h1"
                        className="assignment-detail__header-left-title"
                    >
                        {assignment.task?.title || "Без названия"}
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

                    {isSubmitButtonActive && (
                        <MyButton
                            className={`assignment-detail__submit-btn ${
                                showWorkForm
                                    ? "assignment-detail__submit-btn--active"
                                    : ""
                            }`}
                            text={getSubmitButtonText()}
                            onClick={handleSubmitClick}
                        />
                    )}
                </div>
            </div>

            <div className="assignment-detail__body">
                <div className="assignment-detail__info">
                    <section>
                        <Text
                            tag="h2"
                            className="assignment-detail__info-caption"
                        >
                            Преподаватель:
                        </Text>
                        <Text tag="p">
                            {assignment.creator?.last_name || ""}{" "}
                            {assignment.creator?.first_name || ""}{" "}
                            {assignment.creator?.middle_name || ""}
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
                            {assignment.task?.description || "Нет описания"}
                        </Text>
                    </section>

                    {assignment.task?.comment && (
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

                    {assignment.task_files?.length > 0 && (
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

                    {(showWorkForm ||
                        assignment.status ===
                            ASSIGNMENTS_STATUSES.SUBMITTED) && (
                        <SubmissionForm
                            ref={workFormRef}
                            assignmentId={id}
                            onSubmissionSuccess={handleSubmitWork}
                            isSubmitted={
                                assignment.status ===
                                ASSIGNMENTS_STATUSES.SUBMITTED
                            }
                        />
                    )}

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
