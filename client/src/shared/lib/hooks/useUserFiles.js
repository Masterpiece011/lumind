import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserFiles } from "@/shared/api/uploadFileAPI";

const useUserFiles = (userId) => {
    const dispatch = useDispatch();
    const {
        userFiles,
        loading,
        error,
        total = 0,
        page = 1,
    } = useSelector((state) => ({
        userFiles: state.file?.userFiles || [],
        loading: state.file?.loading || false,
        error: state.file?.error || null,
        total: state.file?.total || 0,
        page: state.file?.page || 1,
    }));

    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (userId && !initialLoadDone.current) {
            initialLoadDone.current = true;
            dispatch(
                getUserFiles({
                    userId,
                    page: 1,
                    quantity: 8,
                }),
            );
        }
    }, [userId, dispatch]);

    const loadMore = () => {
        if (!loading && userFiles.length < total) {
            dispatch(
                getUserFiles({
                    userId,
                    page: page + 1,
                    quantity: 8,
                }),
            );
        }
    };

    return {
        files: userFiles,
        loading,
        error,
        total,
        loadMore,
        hasMore: userFiles.length < total,
    };
};

export { useUserFiles };
