import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserSubmissions } from "@/shared/api/submissionAPI";

const useUserFiles = (userId) => {
    const dispatch = useDispatch();
    const submissionsData = useSelector(
        (state) => state.submissions.submissions || [],
    );
    const [userFiles, setUserFiles] = useState([]);

    useEffect(() => {
        if (userId) {
            dispatch(getUserSubmissions(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (Array.isArray(submissionsData)) {
            const uniqueFiles = new Map();

            submissionsData.forEach((submission) => {
                (submission.submissions_investments || []).forEach((file) => {
                    if (!uniqueFiles.has(file.file_url)) {
                        uniqueFiles.set(file.file_url, {
                            ...file,
                            submissionDate: submission.created_at,
                            assignmentTitle:
                                submission.Assignment?.title ||
                                "Неизвестное задание",
                        });
                    }
                });
            });

            const recentFiles = Array.from(uniqueFiles.values())
                .sort(
                    (a, b) =>
                        new Date(b.submissionDate) - new Date(a.submissionDate),
                )
                .slice(0, 8);

            setUserFiles(recentFiles);
        }
    }, [submissionsData]);

    return userFiles;
};

export { useUserFiles };
