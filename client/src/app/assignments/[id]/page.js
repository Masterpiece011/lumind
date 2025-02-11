"use client";

import { SubmissionForm } from "@/app/components/views/Submissions/SubmissionsForm";
import { getAssignmentById } from "@/app/api/assignmentsAPI";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";

const AssignmentsDetailPage = () => {
    const { id } = useParams();
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
            <h1>{assignment.title}</h1>
            <h2>Описание:</h2>
            <p>{assignment.description}</p>

            <h2>Создатель:</h2>
            <p>
                {assignment.creator
                    ? `${assignment.creator.first_name} ${assignment.creator.middle_name}
                       ${assignment.creator.last_name} (${assignment.creator.email})`
                    : "Неизвестно"}
            </p>

            <h2>Команда:</h2>
            <p>
                {assignment.teams?.length > 0
                    ? assignment.teams[0].name
                    : "Неизвестно"}
            </p>

            <p>
                Создана:{" "}
                {assignment.created_at
                    ? new Date(assignment.created_at).toLocaleDateString()
                    : "Дата неизвестна"}
            </p>

            <h2>Комментарий:</h2>
            <p>{assignment.comment}</p>

            {assignment.Assignments_investments?.length > 0 && (
                <>
                    <h2>Вложения:</h2>
                    <ul>
                        {assignment.Assignments_investments.map((file) => (
                            <li key={file.id}>
                                <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {file.file_url}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <SubmissionForm submissionId={id} />
        </div>
    );
};

export default AssignmentsDetailPage;
