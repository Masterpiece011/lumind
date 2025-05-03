import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserFiles } from "@/shared/api/uploadFileAPI";

const useUserFiles = (userId) => {
    const dispatch = useDispatch();
    const { userFiles, loading, error } = useSelector((state) => ({
        userFiles: state.file?.userFiles || [],
        loading: state.file?.loading || false,
        error: state.file?.error || null,
    }));

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (userId && !loading && userFiles.length === 0) {
                console.log("Fetching files for user:", userId);
                dispatch(getUserFiles(userId));
            }
        }
    }, [userId, loading, dispatch]);

    return userFiles;
};

export { useUserFiles };
