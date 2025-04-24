"use client";

import React, { useEffect, useState, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/shared/api/assignmentsAPI";
import "./AssignmentsComp.scss";
import { MyButton } from "@/shared/uikit/MyButton";

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

    useEffect(() => {
        if (!userId) {
            return;
        }
        dispatch(getAssignments({ userId }));
    }, [dispatch, userId]);

    const [filter, setFilter] = useState("all");

    if (loading) return <div className="assignments__loading">Загрузка...</div>;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    const handleSetNewFilter = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);

            dispatch(getAssignments({ userId, status: newFilter }));
        }
    };

    return (
        <div className="assignments">
            <h1 className="assignments__title">Задания</h1>

            {/* Фильтры с сохранением ссылок на функции */}
            <Filters
                currentFilter={filter}
                onFilterChange={handleSetNewFilter}
            />

            <div className="assignments__divider"></div>

            {/* Список заданий */}
            <AssignmentsList
                assignments={assignments}
                assignmentsTotal={assignmentsTotal}
                onSelect={onSelectAssignment}
                isLoading={loading}
            />
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
                <span className="assignments__status">{labels[status]}</span>
                {/* <span className="assignments__team">
                    {assignment.teams?.[0]?.name || "Неизвестно"}
                </span> */}
            </div>
            <h2 className="assignments__name">{assignment.title}</h2>
            <div className="assignments__deadline">
                <p>
                    Срок: {new Date(assignment.plan_date).toLocaleDateString()}
                </p>
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
                <p className="assignments__empty"></p>
            )}
        </ul>
    ),
);

export { AssignmentsPage };
