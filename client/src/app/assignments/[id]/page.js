"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { getAssignmentById } from "@/app/api/assignmentsAPI";
import { SubmissionForm } from "@/app/components/views/Submissions/SubmissionsForm";
import "../AssignmentDetail.scss";
import { MyButton } from "@/app/components/uikit";

const AssignmentsDetailPage = () => {
    const { id } = useParams();
    const { submission_id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const submissionFormRef = useRef(null);

    const user_id = useSelector((state) => state.user.user?.id);

    useEffect(() => {
        const fetchAssignment = async () => {
            if (user_id) {
                try {
                    const data = await getAssignmentById(id, user_id);
                    setAssignment(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User is not authenticated.");
                setLoading(false);
            }
        };

        if (id) {
            fetchAssignment();
        }
    }, [id, user_id]);

    const handleMyWorkClick = () => {
        setShowSubmissionForm(!showSubmissionForm);
    };

    const handleSubmitClick = () => {
        if (submissionFormRef.current) {
            submissionFormRef.current.handleSubmit();
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!assignment) return <div>Задание не найдено</div>;

    const score = assignment.score ?? "Без оценки";
    const submissionExists = assignment.submissionExists ?? false;

    return (
        <div className="assignment-detail">
            <div className="assignment-detail__header">
                <div className="assignment-detail__header-left">
                    <h1 className="assignment-detail__title">
                        {assignment.title}
                    </h1>
                    <div className="assignment-detail__meta">
                        Срок сдачи: {assignment.deadline || "Не указан"}
                    </div>
                </div>
                <div className="assignment-detail__header-right">
                    <div className="assignment-detail__score">
                        Оценка: {score}
                    </div>
                    <MyButton
                        className="assignment-detail__submit-btn"
                        onClick={handleSubmitClick}
                        disabled={loading}
                    >
                        {loading}
                        Сдать
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
                            {assignment.description || "Инструкция не указана"}
                        </p>
                    </div>

                    <div className="assignment-detail__section">
                        <h2 className="assignment-detail__section-title">
                            Создатель:
                        </h2>
                        <p className="assignment-detail__section-text">
                            {assignment.creator
                                ? `${assignment.creator.first_name} ${assignment.creator.middle_name}
                   ${assignment.creator.last_name} (${assignment.creator.email})`
                                : "Неизвестно"}
                        </p>
                    </div>

                    <div className="assignment-detail__section">
                        <h2 className="assignment-detail__section-title">
                            Команда:
                        </h2>
                        <p className="assignment-detail__section-text">
                            {assignment.teams?.length > 0
                                ? assignment.teams[0].name
                                : "Неизвестно"}
                        </p>
                    </div>

                    {assignment.Assignments_investments?.length > 0 && (
                        <div className="assignment-detail__section">
                            <h2 className="assignment-detail__section-title">
                                Вложения:
                            </h2>
                            <ul className="assignment-detail__attachment-list">
                                {assignment.Assignments_investments.map(
                                    (file) => (
                                        <li key={file.id}>
                                            <a
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {file.file_url}
                                            </a>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
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

                    {showSubmissionForm && (
                        <SubmissionForm
                            ref={submissionFormRef}
                            assignment_id={id}
                            submission_id={submission_id}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentsDetailPage;
