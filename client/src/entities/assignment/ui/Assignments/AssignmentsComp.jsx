"use client";

import React, { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { Filters } from "../Filters";
import { AssignmentsList } from "../AssignmentsList";

import "./AssignmentsComp.scss";

import { MyButton } from "@/shared/uikit/MyButton";
import Text from "@/shared/ui/Text";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";


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


    const [filter, setFilter] = useState("all");

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


const Filters = memo(({ currentFilter, onFilterChange }) => (
    <div className="assignments__filters">
        {["all", "assigned", "completed", "failed"].map((filterType) => (
            <FilterButton
                key={filterType}
                type={filterType}
                isActive={currentFilter === filterType}
                onClick={() => onFilterChange(filterType)}
            />
        ))}
    </div>
));

const FilterButton = memo(({ type, isActive, onClick }) => {
    const labels = {
        all: "Все задания",
        assigned: "Назначенные",
        completed: "Выполненные",
        failed: "Проваленные",
    };

    return (
        <MyButton
            className={`assignments__filter-button ${
                isActive ? "assignments__filter-button--active" : ""
            }`}
            onClick={onClick}
        >
            {labels[type]}
        </MyButton>
    );
});

const AssignmentCard = memo(({ assignment, status, onSelect }) => {
    const labels = {
        assigned: "Назначено",
        completed: "Выполнено",
        failed: "Провалено",
    };

    return (
        <li
            className="assignments__card"
            onClick={() => onSelect(assignment.id)}
        >
            <div className="assignments__header">
                <Text tag="span" className="assignments__status">
                    {labels[status]}
                </Text>
                {/* <span className="assignments__team">        ПОКА ЧТО НЕ ДОРАБОТАНО
                    {assignment.teams?.[0]?.name || "Неизвестно"}
                </span> */}
            </div>
            <Text tag="h2" className="assignments__name">
                {assignment.title}
            </Text>
            <div className="assignments__deadline">
                <Text tag="p">
                    Срок: {new Date(assignment.plan_date).toLocaleDateString()}
                </Text>
            </div>
        </li>
    );
});

const AssignmentsList = memo(
    ({ assignments, assignmentsTotal, onSelect, isLoading }) => (
        <ul
            className={`assignments__cards-list ${isLoading ? "assignments__cards-list--loading" : ""}`}
        >
            {assignmentsTotal > 0 ? (
                assignments.map((assignment) => (
                    <AssignmentCard
                        key={assignment.id}
                        status={assignment.status}
                        assignment={assignment}
                        onSelect={onSelect}
                    />
                ))
            ) : (
                <Text tag="p" className="assignments__empty">
                    Заданий нет
                </Text>
            )}
        </ul>
    ),
);

export { AssignmentsPage };
