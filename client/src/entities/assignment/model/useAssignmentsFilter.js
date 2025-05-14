import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    getUserAssignments,
    getUserTeamAssignments,
} from "@/shared/api/assignmentsAPI";

export const useAssignmentsFilter = ({ userId, teamId, activeTab }) => {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState("all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    useEffect(() => {
        if (activeTab === "assignments" && userId) {
            setIsFilterLoading(true);
            const action = teamId
                ? getUserTeamAssignments({
                      userId,
                      teamId,
                      status: filter === "all" ? undefined : filter,
                  })
                : getUserAssignments({
                      userId,
                      status: filter === "all" ? undefined : filter,
                  });

            dispatch(action)
                .unwrap()
                .catch(() => {})
                .finally(() => setIsFilterLoading(false));
        }
    }, [filter, activeTab, userId, teamId, dispatch]);

    const handleSetNewFilter = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);
        }
    };

    return { filter, isFilterLoading, handleSetNewFilter };
};
