"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/app/api/assignmentsAPI";

const AssignmentsPage = ({ onSelectAssignment }) => {
    const dispatch = useDispatch();
    const {
        assignments = [],
        loading,
        error,
    } = useSelector((state) => state.assignments);

    const user_id = useSelector((state) => state.user.user?.id);

    useEffect(() => {
        if (user_id) {
            dispatch(getAssignments(user_id));
        }
    }, [dispatch, user_id]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!Array.isArray(assignments))
        return <div>Ошибка: данные о заданиях некорректны.</div>;

    return (
        <div>
            <h1>Задания</h1>
            <ul>
                {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <li
                            key={assignment.id}
                            onClick={() => onSelectAssignment(assignment.id)}
                        >
                            {assignment.title}
                        </li>
                    ))
                ) : (
                    <p>Нет доступных заданий</p>
                )}
            </ul>
        </div>
    );
};

export { AssignmentsPage };
