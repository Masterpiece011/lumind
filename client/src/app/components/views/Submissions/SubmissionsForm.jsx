import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MyButton } from "../../uikit";
import { fetchSubmissionById } from "@/app/store/submissionStore";
import { createSubmission, updateSubmission } from "@/app/api/submissionAPI";

const SubmissionForm = ({ assignmentId }) => {
    const [comment, setComment] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const user_id = useSelector((state) => state.user.user?.id);
    const dispatch = useDispatch();
    const submission = useSelector((state) => state.submissions);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (user_id && assignmentId) {
                dispatch(
                    fetchSubmissionById({
                        submissionId: assignmentId,
                        userId: user_id,
                    }),
                );
            }
        };

        fetchSubmission();
    }, [user_id, assignmentId, dispatch]);

    useEffect(() => {
        if (submission) {
            setComment(submission.comment || "");
            setFiles(submission.Assignments_investments || []);
        }
    }, [submission]);

    const handleFileChange = (e) => {
        setFiles([...files, ...e.target.files]);
    };

    const handleDeleteFile = (fileId) => {
        setFiles(files.filter((file) => file.id !== fileId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (submission) {
                await updateSubmission({
                    id: submission.id,
                    comment,
                    investments: files,
                });
            } else {
                await createSubmission({
                    user_id,
                    assignment_id: assignmentId,
                    comment,
                    investments: files,
                });
            }
        } catch (err) {
            setError("Ошибка при отправке данных.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Ваше Задание</h1>
            <div>
                <label htmlFor="comment">Комментарий:</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="files">Прикрепить файлы:</label>
                <input type="file" multiple onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
                <div>
                    <h3>Прикрепленные файлы:</h3>
                    <ul>
                        {files.map((file, index) => (
                            <li key={file.id || file.name || index}>
                                <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {file.file_url}
                                </a>
                                <MyButton
                                    onClick={() => handleDeleteFile(file.id)}
                                >
                                    Удалить
                                </MyButton>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <div className="error">{error}</div>}
            <MyButton type="submit" disabled={loading}>
                {loading ? "Отправка..." : "Отправить"}
            </MyButton>
        </form>
    );
};

export { SubmissionForm };
