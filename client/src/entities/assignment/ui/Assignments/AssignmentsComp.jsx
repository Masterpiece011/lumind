"use client";

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
        (prev, next) =>
            prev.assignments === next.assignments &&
            prev.assignmentsTotal === next.assignmentsTotal &&
            prev.loading === next.loading &&
            prev.error === next.error,
    );

    const [filter, setFilter] = useState("all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        dispatch(getAssignments({ userId }));
    }, [dispatch, userId]);

    if (loading) return <ClockLoader className="assignments__loading" />;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    const handleSetNewFilter = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);
            setIsFilterLoading(true);
            dispatch(getAssignments({ userId, status: newFilter })).finally(
                () => setIsFilterLoading(false),
            );
        }
    };

    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    return (
        <div className="assignments">
            <Text tag="h1" className="assignments__title">
                Задания
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
