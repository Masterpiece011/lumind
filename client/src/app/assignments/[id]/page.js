"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { getAssignmentById } from "@/app/api/assignmentsAPI";
import { deleteSubmission } from "@/app/api/submissionAPI";
import { SubmissionForm } from "@/app/components/views/Submissions/SubmissionsForm";
import "../AssignmentDetail.scss";
import { MyButton } from "@/app/components/uikit";
import { FileItem } from "@/app/components/FileComp";
import {
    setAssignment,
    setLoading,
    setError,
} from "@/app/store/assignmentStore";

const AssignmentsDetailPage = () => {
    const { id, submission_id } = useParams();
    const dispatch = useDispatch();
    const user_id = useSelector((state) => state.user.user?.id);
    const assignment = useSelector((state) => state.assignments);
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const submissionFormRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAssignment = async () => {
            if (user_id) {
                try {
                    dispatch(setLoading());
                    const data = await getAssignmentById(id, user_id);

                    if (isMounted) {
                        dispatch(
                            setAssignment({
                                ...data,
                                submissions_investments: data.submission
                                    ? data.submission.submissions_investments
                                    : [],
                            }),
                        );

                        setIsSubmitted(
                            data.submission &&
                                data.submission.submitted_date !== null,
                        );
                    }
                } catch (err) {
                    if (isMounted) {
                        dispatch(setError(err.message));
                    }
                }
            } else {
                if (isMounted) {
                    dispatch(setError("Пользователь не авторизован."));
                }
            }
        };

        if (id) {
            fetchAssignment();
        }

        return () => {
            isMounted = false;
        };
    }, [id, user_id, dispatch]);

    const handleMyWorkClick = () => {
        setShowSubmissionForm(!showSubmissionForm);
    };

    const handleSubmissionSuccess = async (updatedFiles) => {
        let isMounted = true;
        try {
            console.log("Обновленные файлы:", updatedFiles);
            const updatedAssignment = {
                ...assignment,
                submissions_investments: updatedFiles.map((file) => ({
                    id: file.id,
                    file_url: file.file_url,
                })),
                submission: {
                    ...assignment.submission,
                    id: updatedFiles.submission_id,
                    submitted_date: new Date().toISOString(),
                },
            };

            dispatch(setAssignment(updatedAssignment));
            setIsSubmitted(true);

            const data = await getAssignmentById(id, user_id);
            if (isMounted) {
                dispatch(
                    setAssignment({
                        ...data,
                        submissions_investments: data.submission
                            ? data.submission.submissions_investments
                            : [],
                        submission: data.submission ?? {},
                    }),
                );
            }
        } catch (err) {
            if (isMounted) {
                console.error("Ошибка при обновлении задания:", err);
                dispatch(setError("Ошибка при обновлении задания."));
            }
        }

        return () => {
            isMounted = false;
        };
    };

    const handleSubmitClick = () => {
        if (submissionFormRef.current) {
            submissionFormRef.current.handleSubmit();
        }
    };

    const handleCancelSubmission = async () => {
        const submissionId = assignment.assignments?.submission?.id;
        console.log("Submission ID для удаления:", submissionId);

        if (!submissionId) {
            dispatch(setError("ID отправки не найден."));
            return;
        }

        try {
            await deleteSubmission(submissionId);
            setIsSubmitted(false);

            const data = await getAssignmentById(id, user_id);

            dispatch(
                setAssignment({
                    ...data,
                    submissions_investments: [],
                    submission: null,
                }),
            );
        } catch (err) {
            console.error("Ошибка при отмене сдачи задания:", err);
            dispatch(setError("Ошибка при отмене сдачи задания."));
        }
    };

    if (assignment.loading) return <div>Загрузка...</div>;
    if (assignment.error) return <div>Ошибка: {assignment.error}</div>;
    if (!assignment.assignments) return <div>Задание не найдено</div>;

    const score = assignment.assignments.score ?? "Без оценки";
    const submissionExists = assignment.assignments.submissionExists ?? false;

    return (
        <div className="assignment-detail">
            <div className="assignment-detail__header">
                <div className="assignment-detail__header-left">
                    <h1 className="assignment-detail__title">
                        {assignment.assignments.title}
                    </h1>
                    <div className="assignment-detail__meta">
                        Срок сдачи:{" "}
                        {assignment.assignments.deadline || "Не указан"}
                    </div>
                </div>
                <div className="assignment-detail__header-right">
                    <div className="assignment-detail__score">
                        Оценка: {score}
                    </div>
                    <MyButton
                        className="assignment-detail__submit-btn"
                        onClick={
                            isSubmitted &&
                            assignment.assignments?.submission?.id
                                ? handleCancelSubmission
                                : handleSubmitClick
                        }
                        disabled={assignment.loading}
                    >
                        {assignment.loading
                            ? "Отправка..."
                            : isSubmitted &&
                                assignment.assignments?.submission?.id
                              ? "Отменить сдачу задания"
                              : "Сдать"}
                    </MyButton>
                </div>
            </div>

            <div className="assignment-detail__body">
                <div className="assignment-detail__info">
                    <div className="assignment-detail__section">
                        <h2 className="assignment-detail__section-title">
                            Инструкция:
                        </h2>
                        <p className="assignment-detail__section-text">
                            {assignment.assignments.description ||
                                "Инструкция не указана"}
                        </p>
                    </div>

                    <div className="assignment-detail__section">
                        <h2 className="assignment-detail__section-title">
                            Создатель:
                        </h2>
                        <p className="assignment-detail__section-text">
                            {assignment.assignments.creator
                                ? `${assignment.assignments.creator.first_name} ${assignment.assignments.creator.middle_name}
                                   ${assignment.assignments.creator.last_name} (${assignment.assignments.creator.email})`
                                : "Неизвестно"}
                        </p>
                    </div>

                    <div className="assignment-detail__section">
                        <h2 className="assignment-detail__section-title">
                            Команда:
                        </h2>
                        <p className="assignment-detail__section-text">
                            {assignment.assignments.teams?.length > 0
                                ? assignment.assignments.teams[0].name
                                : "Неизвестно"}
                        </p>
                    </div>

                    <div className="assignment-detail__section">
                        <h2 className="assignment-detail__section-title">
                            Вложения к заданию:
                        </h2>
                        <ul className="assignment-detail__attachment-list">
                            {assignment.assignments.assignments_investments?.map(
                                (file) => (
                                    <li key={file.id}>
                                        <FileItem fileUrl={file.file_url} />
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                </div>

                <div className="assignment-detail__submission">
                    <div className="assignment-detail__submission-header">
                        <h2 className="assignment-detail__submission-title">
                            Моя работа
                        </h2>
                        <MyButton
                            className="assignment-detail__my-work-btn"
                            onClick={handleMyWorkClick}
                        >
                            {showSubmissionForm ? "Скрыть" : "Моя работа"}
                        </MyButton>
                        {submissionExists ? (
                            <span className="assignment-detail__submission-status">
                                Уже отправлено
                            </span>
                        ) : (
                            <span className="assignment-detail__submission-status">
                                Черновик
                            </span>
                        )}
                    </div>

                    {showSubmissionForm ? (
                        <SubmissionForm
                            ref={submissionFormRef}
                            assignment_id={id}
                            submission_id={submission_id}
                            onSubmissionSuccess={handleSubmissionSuccess}
                            isSubmitted={isSubmitted}
                        />
                    ) : (
                        <div className="assignment-detail__section">
                            <h2 className="assignment-detail__section-title">
                                Вложения к ответу:
                            </h2>
                            {assignment.assignments.submissions_investments
                                ?.length > 0 ? (
                                <ul className="assignment-detail__attachment-list">
                                    {assignment.assignments.submissions_investments.map(
                                        (file) =>
                                            file.file_url && (
                                                <li key={file.id}>
                                                    <FileItem
                                                        fileUrl={file.file_url}
                                                    />
                                                </li>
                                            ),
                                    )}
                                </ul>
                            ) : (
                                <p>Нет вложений к ответу.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentsDetailPage;
