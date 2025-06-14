"use client";
import "./AssignmentDetail.scss";
import React, { useEffect, useState } from "react";
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
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById(id);
            setAssignment(response.assignment);
            setComment(response.assignment.comment || "");
            setFiles(response.assignment.files || []);
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

        if (files.length + selectedFiles.length > 10) {
            setError("Нельзя прикрепить больше 10 файлов");
            return;
        }

        const maxSize = 50 * 1024 * 1024;
        const oversizedFile = selectedFiles.find((file) => file.size > maxSize);

        if (oversizedFile) {
            setError(
                `Файл "${oversizedFile.name}" слишком большой (макс. 50MB)`,
            );
            return;
        }

        const duplicateFiles = selectedFiles.filter((newFile) =>
            files.some(
                (existingFile) => existingFile.original_name === newFile.name,
            ),
        );

        if (duplicateFiles.length) {
            setError(`Файл "${duplicateFiles[0].name}" уже прикреплен`);
            return;
        }

        try {
            const response = await uploadFiles({
                files: selectedFiles,
                entityId: id,
                entityType: "assignment",
                onUploadProgress: (progress) => {
                    setUploadProgress(
                        Math.round((progress.loaded * 100) / progress.total),
                    );
                },
            });
            setFiles((prev) => [...prev, ...response.files]);
            setUploadProgress(0);
            e.target.value = "";
        } catch (err) {
            setError("Ошибка загрузки файлов: " + err.message);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await deleteFile({ fileId });
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

    const handleSubmitWork = async () => {
        try {
            setLoading(true);
            const response = await updateAssignment({
                assignment_id: assignment.id,
                status: ASSIGNMENTS_STATUSES.SUBMITTED,
                comment: comment,
            });

            const currentCreator = assignment.creator;
            setAssignment({
                ...response.assignment,
                creator: response.assignment.creator || currentCreator,
            });
            setFiles(response.assignment.files || []);
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
            });

            const currentCreator = assignment.creator;
            setAssignment({
                ...response.assignment,
                creator: response.assignment.creator || currentCreator,
            });
            setFiles(response.assignment.files || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Ошибка при отмене отправки",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleButtonClick = async () => {
        if (
            [
                ASSIGNMENTS_STATUSES.COMPLETED,
                ASSIGNMENTS_STATUSES.SUBMITTED,
            ].includes(assignment.status)
        ) {
            await handleCancelSubmission();
            return;
        }
        await handleSubmitWork();
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
                return "Сдать работу";
        }
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;
    if (!assignment) return <Text tag="p">Задание не найдено</Text>;

    return (
        <main className="assignment-detail">
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
                        className="assignment-detail__submit-btn"
                        text={getSubmitButtonText()}
                        onClick={handleButtonClick}
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
                            {assignment.creator
                                ? `${assignment.creator.last_name || ""} ${assignment.creator.first_name || ""}`
                                : "Не указан"}
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

                    {assignment.task?.files?.length > 0 && (
                        <section>
                            <Text
                                tag="h2"
                                className="assignment-detail__info-caption"
                            >
                                Файлы задания:
                            </Text>
                            <ul className="files-list">
                                {assignment.task.files.map((file) => (
                                    <li key={file.id}>
                                        <FileItem
                                            fileUrl={file.file_url}
                                            fileName={file.original_name}
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

                    {error && (
                        <div className="submission-form__error">{error}</div>
                    )}

                    <form className="submission-form">
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

                        {assignment.status !==
                            ASSIGNMENTS_STATUSES.SUBMITTED && (
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
                                    {(files || []).map((file) => (
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
                        )}

                        <Text tag="h3" className="files-title">
                            Прикреплённые файлы:
                        </Text>
                        {files.length > 0 ? (
                            <ul className="files-list">
                                {files.map((file) => (
                                    <li key={file.id}>
                                        <FileItem
                                            fileUrl={file.file_url}
                                            fileName={file.original_name}
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
                        ) : (
                            <Text tag="p">Файлы не прикреплены</Text>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
};

export { AssignmentDetailPage };
