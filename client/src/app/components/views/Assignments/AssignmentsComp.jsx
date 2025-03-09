"use client";

import React, { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/app/api/assignmentsAPI";
import "./AssignmentsComp.scss";
import { MyButton } from "../../uikit";

const AssignmentsPage = memo(({ onSelectAssignment }) => {
    const dispatch = useDispatch();
    const {
        assignments = [],
        loading,
        error,
    } = useSelector((state) => state.assignments);

    const user_id = useSelector((state) => state.user.user?.id);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (user_id) {
            dispatch(getAssignments({ userId: user_id, filter }));
        }
    }, [dispatch, user_id, filter]);

    if (loading) return <div className="assignments__loading">Загрузка...</div>;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;
    if (!Array.isArray(assignments))
        return (
            <div className="assignments__error">
                Ошибка: данные о заданиях некорректны.
            </div>
        );

    return (
        <div className="assignments">
            <h1 className="assignments__title">Задания</h1>

            {/* Фильтры */}
            <div className="assignments__filters">
                <MyButton
                    className={`assignments__filter-button ${
                        filter === "all"
                            ? "assignments__filter-button--active"
                            : ""
                    }`}
                    onClick={() => setFilter("all")}
                >
                    Все задания
                </MyButton>
                <MyButton
                    className={`assignments__filter-button ${
                        filter === "current"
                            ? "assignments__filter-button--active"
                            : ""
                    }`}
                    onClick={() => setFilter("current")}
                >
                    Текущие
                </MyButton>
                <MyButton
                    className={`assignments__filter-button ${
                        filter === "completed"
                            ? "assignments__filter-button--active"
                            : ""
                    }`}
                    onClick={() => setFilter("completed")}
                >
                    Выполненные
                </MyButton>
                <MyButton
                    className={`assignments__filter-button ${
                        filter === "overdue"
                            ? "assignments__filter-button--active"
                            : ""
                    }`}
                    onClick={() => setFilter("overdue")}
                >
                    Просроченные
                </MyButton>
            </div>

            <div className="assignments__divider"></div>

            {/* Список заданий */}
            <div
                className={`assignments__card-wrapper ${loading ? "assignments__card-wrapper--loading" : ""}`}
            >
                {assignments.length > 0 ? (
                    assignments.map((assignment) => {
                        const dueDate = new Date(assignment.due_date);
                        const now = new Date();
                        const isOverdue = dueDate < now;
                        const hasSubmission =
                            assignment.submission !== null &&
                            assignment.submission !== undefined;

                        return (
                            <div
                                key={assignment.id}
                                className="assignments__card"
                                onClick={() =>
                                    onSelectAssignment(assignment.id)
                                }
                            >
                                <div className="assignments__header">
                                    <span className="assignments__date">
                                        {new Date(
                                            assignment.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                    {hasSubmission && isOverdue && (
                                        <div className="assignments__status assignments__status--overdue">
                                            Сдано с опозданием
                                        </div>
                                    )}
                                    <span className="assignments__team">
                                        {assignment.teams?.length > 0
                                            ? assignment.teams[0].name
                                            : "Неизвестно"}
                                    </span>
                                </div>
                                <h2 className="assignments__name">
                                    {assignment.title}
                                </h2>
                                <div className="assignments__deadline">
                                    Срок:{" "}
                                    {new Date(
                                        assignment.due_date,
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="assignments__empty"></p>
                )}
            </div>
        </div>
    );
});

export { AssignmentsPage };
