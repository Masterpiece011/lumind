import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { MyButton } from "../../uikit";
import { fetchSubmissionById } from "@/app/store/submissionStore";
import { createSubmission, updateSubmission } from "@/app/api/submissionAPI";
import { uploadFile, uploadMultipleFiles } from "@/app/api/uploadFileAPI";
import { FileItem } from "../../FileComp";

const SubmissionForm = forwardRef(({ assignment_id, submission_id }, ref) => {
    const [comment, setComment] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const user_id = useSelector((state) => state.user.user?.id);
    const dispatch = useDispatch();
    const submission = useSelector((state) => state.submissions);

    useEffect(() => {
        if (user_id && submission_id) {
            dispatch(
                fetchSubmissionById({
                    submission_id,
                    userId: user_id,
                }),
            );
        }
    }, [user_id, submission_id, dispatch]);

    useEffect(() => {
        if (submission) {
            setComment(submission.comment || "");
            setFiles(submission.Assignments_investments || []);
        }
    }, [submission]);

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
                        console.error("Ошибка загрузки файла:", file.name, err);
                        return null;
                    }
                }),
            );

            successfulUploads = uploadedData.filter((file) => file !== null);
            setFiles([...files, ...successfulUploads]);
        } catch (err) {
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

            let response;

            if (submission && submission.id) {
                response = await updateSubmission({
                    submission_id: submission.id,
                    comment,
                    investments: fileIds,
                });
            } else {
                response = await createSubmission({
                    user_id,
                    assignment_id: assignment_id,
                    comment,
                    investments: fileIds,
                });
            }

            console.log("Ответ от сервера:", response);
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
                />
            </div>

            <div className="submission-form__group">
                <label htmlFor="files">Прикрепить файлы:</label>
                <input type="file" multiple onChange={handleFileChange} />
            </div>

            {files.length > 0 && (
                <div>
                    <h3>Прикрепленные файлы:</h3>
                    <ul className="submission-form__file-list">
                        {files.map((file, index) => (
                            <li key={file.id || index}>
                                <FileItem
                                    fileUrl={file.file_url}
                                    onDelete={() => handleDeleteFile(file.id)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <div className="submission-form__error">{error}</div>}
        </form>
    );
});

export { SubmissionForm };
