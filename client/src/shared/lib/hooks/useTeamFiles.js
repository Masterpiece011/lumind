import { getTeamFiles } from "@/shared/api/uploadFileAPI";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const useTeamFiles = (teamId) => {
    const dispatch = useDispatch();
    const {
        teamFiles,
        loading,
        error,
        total = 0,
        page = 1,
    } = useSelector((state) => ({
        teamFiles: state.files?.teamFiles || [],
        loading: state.files?.loading || false,
        error: state.files?.error || null,
        total: state.files?.total || 0,
        page: state.files?.page || 1,
    }));

    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (teamId && !initialLoadDone.current) {
            initialLoadDone.current = true;
            dispatch(
                getTeamFiles({
                    teamId,
                    page: 1,
                    quantity: 10,
                }),
            );
        }
    }, [teamId, dispatch]);

    const loadMore = () => {
        if (!loading && teamFiles.length < total) {
            dispatch(
                getTeamFiles({
                    teamId,
                    page: page + 1,
                    quantity: 10,
                }),
            );
        }
    };

    return {
        files: teamFiles,
        loading,
        error,
        total,
        loadMore,
        hasMore: teamFiles.length < total,
    };
};

export { useTeamFiles };
