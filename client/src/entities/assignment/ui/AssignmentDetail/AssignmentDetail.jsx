"use client";

import "./AssignmentDetail.scss";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { uploadFiles, downloadFile, deleteFile } from "@/shared/api/filesAPI";
import {
    getAssignmentById,
    updateAssignment,
} from "@/shared/api/assignmentsAPI";
import { MyButton } from "@/shared/uikit/MyButton";
import { FileItem } from "@/shared/ui/FileComp";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { ASSIGNMENTS_STATUSES } from "@/shared/constants/assignments";
import Text from "@/shared/ui/Text";

const AssignmentDetailPage = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWorkForm, setShowWorkForm] = useState(false);
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const workFormRef = useRef(null);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById({
                assignmentId: id,
                include: ["task", "assignment_files"],
            });
            setAssignment(response.assignment);
            setComment(response.assignment.comment || "");
            setFiles(response.assignment.assignment_files || []);
            setError(null);
        } catch (err) {
            setError(err.message || "Ошибка загрузки назначения");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAssignment();
    }, [id]);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (!selectedFiles.length) return;

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => formData.append("files", file));

            const response = await uploadFiles({
                entityId: id,
                entityType: "assignment",
                formData,
                onUploadProgress: (progress) => {
                    setUploadProgress(
                        Math.round((progress.loaded * 100) / progress.total),
                    );
                },
            });

            setFiles((prev) => [...prev, ...response.files]);
            setUploadProgress(0);
        } catch (err) {
            setError("Ошибка загрузки файлов: " + err.message);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await deleteFile(fileId);
            setFiles(files.filter((file) => file.id !== fileId));
        } catch (err) {
            setError("Ошибка удаления файла: " + err.message);
        }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            await downloadFile({ fileId, fileName });
        } catch (err) {
            setError("Ошибка скачивания файла: " + err.message);
        }
    };

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await updateAssignment({
                assignment_id: id,
                status: ASSIGNMENTS_STATUSES.SUBMITTED,
                comment,
                files: files.map((f) => f.id),
            });
            setAssignment(response.assignment);
            setShowWorkForm(false);
        } catch (err) {
            setError(
                err.response?.data?.message || "Ошибка при отправке работы",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubmission = async () => {
        try {
            setLoading(true);
            const response = await updateAssignment({
                assignment_id: id,
                status: ASSIGNMENTS_STATUSES.ASSIGNED,
                comment: "",
                files: [],
            });
            setAssignment(response.assignment);
            setFiles([]);
            setComment("");
            setShowWorkForm(false);
        } catch (err) {
            setError(
                err.response?.data?.message || "Ошибка при отмене отправки",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitClick = async () => {
        if (
            [
                ASSIGNMENTS_STATUSES.SUBMITTED,
                ASSIGNMENTS_STATUSES.COMPLETED,
            ].includes(assignment?.status)
        ) {
            await handleCancelSubmission();
            return;
        }
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
                        Задание: {assignment.task?.title || "Без названия"}
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
                        className={`assignment-detail__submit-btn ${showWorkForm ? "assignment-detail__submit-btn--active" : ""}`}
                        text={getSubmitButtonText()}
                        onClick={handleSubmitClick}
                    />
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
                                        <FileItem
                                            file={file}
                                            onDownload={() =>
                                                handleDownloadFile(
                                                    file.id,
                                                    file.original_name,
                                                )
                                            }
                                        />
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

                    <form
                        className="submission-form"
                        onSubmit={handleSubmitWork}
                        ref={workFormRef}
                    >
                        {error && (
                            <div className="submission-form__error">
                                {error}
                            </div>
                        )}

                        <div className="submission-form__group">
                            <label htmlFor="comment">Комментарий:</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={
                                    assignment.status ===
                                    ASSIGNMENTS_STATUSES.SUBMITTED
                                }
                            />
                        </div>

                        <div className="submission-form__group">
                            <label htmlFor="files">Прикрепить файлы:</label>
                            <input
                                type="file"
                                id="files"
                                multiple
                                onChange={handleFileChange}
                                disabled={
                                    assignment.status ===
                                    ASSIGNMENTS_STATUSES.SUBMITTED
                                }
                            />
                            {uploadProgress > 0 && (
                                <div className="upload-progress">
                                    <progress
                                        value={uploadProgress}
                                        max="100"
                                    />
                                    <span>{uploadProgress}%</span>
                                </div>
                            )}
                            <div className="submission-form__files">
                                {files.map((file) => (
                                    <FileItem
                                        key={file.id}
                                        file={file}
                                        onDownload={() =>
                                            handleDownloadFile(
                                                file.id,
                                                file.original_name,
                                            )
                                        }
                                        onDelete={() =>
                                            handleDeleteFile(file.id)
                                        }
                                        disabled={
                                            assignment.status ===
                                            ASSIGNMENTS_STATUSES.SUBMITTED
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        {assignment.status !==
                            ASSIGNMENTS_STATUSES.SUBMITTED && (
                            <MyButton
                                type="submit"
                                disabled={loading}
                                className="submission-form__submit"
                            >
                                {loading ? "Отправка..." : "Отправить работу"}
                            </MyButton>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export { AssignmentDetailPage };
