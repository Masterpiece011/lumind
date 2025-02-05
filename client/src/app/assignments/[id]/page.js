"use client";

import { getAssignmentById } from "@/app/http/assignmentsAPI";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AssignmentsDetailPage = ({ id }) => {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user_id = useSelector((state) => state.user.user?.id);

    useEffect(() => {
        const fetchAssignment = async () => {
            if (user_id) {
                try {
                    const data = await getAssignmentById(id, user_id);
                    setAssignment(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User is not authenticated.");
                setLoading(false);
            }
        };

        if (id) {
            fetchAssignment();
        }
    }, [id, user_id]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!assignment) return <div>Задание не найдено</div>;

    return (
        <div>
            <h1>{assignment.name}</h1>
            <p>{assignment.description}</p>
        </div>
    );
};

export default AssignmentsDetailPage;
