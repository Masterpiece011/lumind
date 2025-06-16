"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { uploadFiles } from "@/shared/api/filesAPI";
import { MyButton } from "@/shared/uikit/MyButton";
import Text from "@/shared/ui/Text";
import "./TaskCreateForm.scss";
import { createTask } from "@/shared/api/taskAPI";

export const TaskCreateForm = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [comment, setComment] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let uploadedFiles = [];
            if (files.length > 0) {
                const uploadResponse = await uploadFiles({
                    files,
                    entityType: "task",
                    onUploadProgress: (progress) => {
                        setUploadProgress(
                            Math.round(
                                (progress.loaded * 100) / progress.total,
                            ),
                        );
                    },
                });
                uploadedFiles = uploadResponse.files;
            }

            await createTask({
                title,
                description,
                comment,
                files: uploadedFiles.map((file) => file.file_url),
                creator_id: 1,
            });

            if (onClose) {
                onClose();
            } else {
                router.push("/assignments");
            }
        } catch (err) {
            setError(err.message || "Ошибка при создании задания");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        const maxSize = 50 * 1024 * 1024;
        const oversizedFiles = selectedFiles.filter(
            (file) => file.size > maxSize,
        );

        if (oversizedFiles.length > 0) {
            setError(
                `Файл "${oversizedFiles[0].name}" слишком большой (макс. 50MB)`,
            );
            return;
        }

        setFiles(selectedFiles);
        setError(null);
    };

    return (
        <div className="task-create">
            <Text tag="h2" className="task-create__title">
                Создание нового задания
            </Text>

            <form onSubmit={handleSubmit} className="task-create__form">
                <div className="task-create__group">
                    <label>Название задания*</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="task-create__group">
                    <label>Описание задания</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="task-create__group">
                    <label>Комментарий к заданию</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="task-create__group">
                    <label>Прикрепить файлы (макс. 50MB)</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                    {files.length > 0 && (
                        <div className="task-create__files-preview">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="task-create__file-item"
                                >
                                    {file.name} (
                                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            ))}
                        </div>
                    )}
                    {uploadProgress > 0 && (
                        <div className="task-create__upload-progress">
                            <progress value={uploadProgress} max="100" />
                            <span>{uploadProgress}%</span>
                        </div>
                    )}
                </div>

                {error && <div className="task-create__error">{error}</div>}

                <div className="task-create__actions">
                    <MyButton
                        type="button"
                        text="Отмена"
                        onClick={onClose ? onClose : () => router.back()}
                        variant="outlined"
                        disabled={loading}
                    />
                    <MyButton
                        type="submit"
                        text={loading ? "Создание..." : "Создать задание"}
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};
