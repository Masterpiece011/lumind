"use client";

import React, { useEffect, useState, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/shared/api/assignmentsAPI";
import "./style.scss";
import { MyButton } from "@/shared/uikit/MyButton";

const AssignmentsPage = memo(({ onSelectAssignment }) => {
    const dispatch = useDispatch();
    const assignmentsData = useSelector((state) => state.assignments);
    const user_id = useSelector((state) => state.user.user?.id);

    useEffect(() => {
        if (user_id) {
            dispatch(getAssignments({ userId: user_id, filter: "all" }));
        }
    }, [dispatch, user_id]);

    const [filter, setFilter] = useState("all");

    const filteredAssignments = useMemo(() => {
        if (!Array.isArray(assignmentsData.assignments)) return [];

        const now = new Date();
        return assignmentsData.assignments.filter((assignment) => {
            const dueDate = new Date(assignment.due_date);
            const hasSubmission =
                assignment.submission !== null &&
                assignment.submission !== undefined;

            switch (filter) {
                case "current":
                    return !hasSubmission && dueDate >= now;
                case "completed":
                    return hasSubmission;
                case "overdue":
                    return !hasSubmission && dueDate < now;
                default:
                    return true;
            }
        });
    }, [assignmentsData.assignments, filter]);

    if (assignmentsData.loading)
        return <div className="assignments__loading">Загрузка...</div>;
    if (assignmentsData.error)
        return (
            <div className="assignments__error">
                Ошибка: {assignmentsData.error}
            </div>
        );
    if (!Array.isArray(assignmentsData.assignments)) {
        return (
            <div className="assignments__error">
                Ошибка: данные о заданиях некорректны.
            </div>
        );
    }

    return (
        <div className="assignments">
            <h1 className="assignments__title">Задания</h1>

            {/* Фильтры с сохранением ссылок на функции */}
            <Filters currentFilter={filter} onFilterChange={setFilter} />

            <div className="assignments__divider"></div>

            {/* Список заданий */}
            <AssignmentsList
                assignments={filteredAssignments}
                onSelect={onSelectAssignment}
                isLoading={assignmentsData.loading}
            />
        </div>
    );
});

const Filters = memo(({ currentFilter, onFilterChange }) => (
    <div className="assignments__filters">
        {["all", "current", "completed", "overdue"].map((filterType) => (
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
        current: "Текущие",
        completed: "Выполненные",
        overdue: "Просроченные",
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

const AssignmentsList = memo(({ assignments, onSelect, isLoading }) => (
    <div
        className={`assignments__card-wrapper ${isLoading ? "assignments__card-wrapper--loading" : ""}`}
    >
        {assignments.length > 0 ? (
            assignments.map((assignment) => (
                <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onSelect={onSelect}
                />
            ))
        ) : (
            <p className="assignments__empty"></p>
        )}
    </div>
));

const AssignmentCard = memo(({ assignment, onSelect }) => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const isOverdue = dueDate < now;
    const hasSubmission =
        assignment.submission !== null && assignment.submission !== undefined;

    return (
        <div
            className="assignments__card"
            onClick={() => onSelect(assignment.id)}
        >
            <div className="assignments__header">
                <span className="assignments__date">
                    {new Date(assignment.created_at).toLocaleDateString()}
                </span>
                {hasSubmission && isOverdue && (
                    <div className="assignments__status assignments__status--overdue">
                        Сдано с опозданием
                    </div>
                )}
                <span className="assignments__team">
                    {assignment.teams?.[0]?.name || "Неизвестно"}
                </span>
            </div>
            <h2 className="assignments__name">{assignment.title}</h2>
            <div className="assignments__deadline">
                Срок: {new Date(assignment.due_date).toLocaleDateString()}
            </div>
        </div>
    );
});

export { AssignmentsPage };
