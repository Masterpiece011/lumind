import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAssignments } from "@/shared/api/assignmentsAPI";

export const useAssignmentsFilter = ({ userId, teamId, activeTab }) => {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState("all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    useEffect(() => {
        if (activeTab === "assignments" && userId && teamId) {
            setIsFilterLoading(true);
            dispatch(
                getAssignments({
                    userId,
                    teamId,
                    status: filter === "all" ? undefined : filter,
                }),
            ).finally(() => setIsFilterLoading(false));
        }
    }, [filter, activeTab, userId, teamId, dispatch]);

    const handleSetNewFilter = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);
        }
    };

    return { filter, isFilterLoading, handleSetNewFilter };
};
