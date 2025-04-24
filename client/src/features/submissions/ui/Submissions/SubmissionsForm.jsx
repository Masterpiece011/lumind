import "./SubmissionsForm.scss";

import React, { useState, forwardRef, useImperativeHandle } from "react";

import { useSelector, useDispatch } from "react-redux";

import { MyButton } from "@/shared/uikit/MyButton";
import { FileItem } from "@/shared/ui/FileComp";

import { uploadFile, uploadMultipleFiles } from "@/shared/api/uploadFileAPI";

const SubmissionForm = forwardRef(
    ({ onSubmissionSuccess, isSubmitted }, ref) => {
        const [comment, setComment] = useState("");
        const [files, setFiles] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        const user_id = useSelector((state) => state.user.user?.id);
        const dispatch = useDispatch();

        const handleFileChange = async (e) => {
            const uploadedFiles = Array.from(e.target.files);
            let successfulUploads = [];

            try {
                setLoading(true);
                const uploadedData = await Promise.all(
                    uploadedFiles.map(async (file) => {
                        try {
                            const uploadedFile = await uploadFile(file);
                            return {
                                id: Date.now(),
                                file_url:
                                    uploadedFile.filePath || uploadedFile.path,
                            };
                        } catch (err) {
                            console.error(
                                "Ошибка загрузки файла:",
                                file.name,
                                err,
                            );
                            return null;
                        }
                    }),
                );

                successfulUploads = uploadedData.filter(
                    (file) => file !== null,
                );
                setFiles((prevFiles) => [...prevFiles, ...successfulUploads]);
                setError("Ошибка загрузки файла.");
            } finally {
                setLoading(false);
            }
        };

        const handleDeleteFile = (fileId) => {
            setFiles(files.filter((file) => file.id !== fileId));
        };

        const handleSubmit = async (e) => {
            if (e) e.preventDefault();
            setLoading(true);

            try {
                const fileIds = files
                    .map((file) => file.file_url)
                    .filter((url) => url !== null && url !== undefined);

                if (fileIds.length === 0 && comment.trim() === "") {
                    setError(
                        "Необходимо прикрепить файлы или добавить комментарий.",
                    );
                    return;
                }

                let response;

                console.log("Ответ от сервера:", response);

                const updatedFiles =
                    response.submission?.submissions_investments || [];
                setFiles(updatedFiles);

                if (onSubmissionSuccess) {
                    onSubmissionSuccess(updatedFiles);
                }
            } catch (err) {
                console.error("Ошибка при отправке данных:", err);
                setError("Ошибка при отправке данных.");
            } finally {
                setLoading(false);
            }
        };

        useImperativeHandle(ref, () => ({
            handleSubmit,
        }));

        return (
            <form className="submission-form" onSubmit={handleSubmit}>
                <div className="submission-form__group">
                    <label htmlFor="comment">Комментарий:</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSubmitted}
                    />
                </div>

                <div className="submission-form__group">
                    <label htmlFor="files">Прикрепить файлы:</label>
                    <input
                        type="file"
                        disabled={isSubmitted}
                        multiple
                        onChange={handleFileChange}
                    />
                </div>
            </form>
        );
    },
);

export { SubmissionForm };
