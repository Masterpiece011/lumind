"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MyButton } from "@/shared/uikit/MyButton";
import "./InstructorAssignmentFlow.scss";
import Text from "@/shared/ui/Text";
import { getAssignmentById } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { InstructorStudentsList } from "../InstructorList/InstructorStudentsList";
import { InstructorAssignmentDetail } from "../InstructorDetail/InstructorAssignmentDetail";

export const InstructorAssignmentFlow = () => {
    const { id: assignmentId } = useParams();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignmentData = async () => {
            try {
                setLoading(true);
                const response = await getAssignmentById(assignmentId);

                if (!response?.assignment) {
                    throw new Error("Неверный формат ответа сервера");
                }

                setTaskId(response.assignment.task_id);
                setError(null);
            } catch (error) {
                console.error("Error fetching assignment:", error);
                setError(error.message || "Ошибка загрузки назначения");
            } finally {
                setLoading(false);
            }
        };

        if (assignmentId) fetchAssignmentData();
    }, [assignmentId]);

    if (loading) return <ClockLoader />;
    if (error) return <Text color="danger">{error}</Text>;

    return (
        <div className="instructor-assignment-flow">
            {!selectedUserId ? (
                <InstructorStudentsList
                    taskId={taskId}
                    onSelectUser={setSelectedUserId}
                />
            ) : (
                <>
                    <MyButton
                        text="Назад к списку"
                        onClick={() => setSelectedUserId(null)}
                        className="back-button"
                    />
                    <InstructorAssignmentDetail
                        assignmentId={assignmentId}
                        userId={selectedUserId}
                    />
                </>
            )}
        </div>
    );
};
