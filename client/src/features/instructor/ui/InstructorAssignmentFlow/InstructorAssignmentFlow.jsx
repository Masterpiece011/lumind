"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { InstructorStudentsList } from "../InstructorList/InstructorStudentsList";
import { InstructorAssignmentDetail } from "../InstructorDetail/InstructorAssignmentDetail";
import { MyButton } from "@/shared/uikit/MyButton";
import "./InstructorAssignmentFlow.scss";
import Text from "@/shared/ui/Text";
import { getAssignmentById } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";

export const InstructorAssignmentFlow = () => {
    const { id: assignmentId } = useParams();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [assignmentError, setAssignmentError] = useState(null);
    const [hasTask, setHasTask] = useState(false);

    useEffect(() => {
        const fetchAssignmentData = async () => {
            try {
                console.log("Fetching assignment data for:", assignmentId);
                const response = await getAssignmentById(assignmentId);
                console.log("Full API response:", response);

                if (!response?.assignment) {
                    throw new Error("Неверный формат ответа сервера");
                }

                const assignment = response.assignment;
                const taskExists = assignment.task_id || assignment.task;

                if (taskExists) {
                    setTaskId(assignment.task_id || assignment.task?.id);
                    setHasTask(true);
                    setAssignmentError(null);
                } else {
                    setTaskId(null);
                    setHasTask(false);
                    setAssignmentError(null);
                }
            } catch (error) {
                console.error("Error fetching assignment:", error);
                setAssignmentError(
                    error.message || "Ошибка загрузки назначения",
                );
                setHasTask(false);
            }
        };

        if (assignmentId) {
            fetchAssignmentData();
        } else {
            setAssignmentError("Не указан ID назначения");
        }
    }, [assignmentId]);

    return (
        <div className="instructor-assignment-flow">
            {!selectedUserId ? (
                <div className="students-view">
                    <Text tag="h2">
                        {hasTask
                            ? "Студенты с этим заданием"
                            : "Информация о назначении"}
                    </Text>

                    {assignmentError ? (
                        <Text tag="p" color="danger">
                            {assignmentError}
                        </Text>
                    ) : hasTask ? (
                        <InstructorStudentsList
                            taskId={taskId}
                            onSelectUser={setSelectedUserId}
                        />
                    ) : (
                        <div className="no-task-message">
                            <Text tag="p">
                                Это назначение не связано с заданием
                            </Text>
                            <Text tag="p">
                                Вы можете просмотреть детали назначения ниже
                            </Text>
                            <MyButton
                                text="Просмотреть назначение"
                                onClick={() =>
                                    setSelectedUserId(
                                        assignment.assignment.user_id,
                                    )
                                }
                                className="view-assignment-button"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="detail-view">
                    <MyButton
                        text="Назад"
                        onClick={() => setSelectedUserId(null)}
                        className="back-button"
                    />
                    <InstructorAssignmentDetail
                        assignmentId={assignmentId}
                        userId={selectedUserId}
                    />
                </div>
            )}
        </div>
    );
};
