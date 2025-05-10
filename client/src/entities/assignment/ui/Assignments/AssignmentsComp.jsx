import React, { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { Filters } from "../Filters";
import { AssignmentsList } from "../AssignmentsList";
import "./AssignmentsComp.scss";
import Text from "@/shared/ui/Text";

const AssignmentsPage = memo(({ userId, onSelectAssignment }) => {
    const dispatch = useDispatch();
    const { assignments, assignmentsTotal, loading, error } = useSelector(
        (state) => state.assignments,
    );
    const userRole = useSelector((state) => state.user.user?.role);
    const isInstructor = userRole === "INSTRUCTOR";

    const [filter, setFilter] = useState("all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    useEffect(() => {
        const fetchAssignments = () => {
            dispatch(
                getAssignments({
                    userId: userId,
                    status: filter === "all" ? undefined : filter,
                    include: ["task", "files"],
                    // Для преподавателя добавляем флаг creator
                    ...(isInstructor ? { creator_id: userId } : {}),
                }),
            );
        };

        if (userId) {
            fetchAssignments();
        }
    }, [dispatch, userId, filter, isInstructor]);

    if (loading) return <ClockLoader className="assignments__loading" />;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    const handleSetNewFilter = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);
            setIsFilterLoading(true);
            dispatch(
                getAssignments({
                    userId: userId,
                    status: newFilter,
                    include: ["task", "files"],
                }),
            ).finally(() => setIsFilterLoading(false));
        }
    };

    return (
        <div className="assignments">
            <Text tag="h1" className="assignments__title">
                Мои задания
            </Text>

            <Filters
                currentFilter={filter}
                onFilterChange={handleSetNewFilter}
            />

            <div className="assignments__divider"></div>

            {loading || isFilterLoading ? (
                <div className="assignments__loader">
                    <ClockLoader loading={true} />
                </div>
            ) : (
                <AssignmentsList
                    assignments={assignments}
                    assignmentsTotal={assignmentsTotal}
                    onSelect={onSelectAssignment}
                    isLoading={loading}
                    isFilterLoading={isFilterLoading}
                />
            )}
        </div>
    );
});

export { AssignmentsPage };
