"use client";
import React, { useState, useEffect } from "react";
import {
    useParams,
    useRouter,
    usePathname,
    useSearchParams,
} from "next/navigation";
import { MyButton } from "@/shared/uikit/MyButton";

import "./InstructorAssignmentFlow.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

import Text from "@/shared/ui/Text";
import { getAssignmentById } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { InstructorStudentsList } from "../InstructorList/InstructorStudentsList";
import { InstructorAssignmentDetail } from "../InstructorDetail/InstructorAssignmentDetail";

export const InstructorAssignmentFlow = ({ taskId }) => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const currentTaskId = taskId || searchParams.get("taskId");

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const assignmentId = params?.id;
    const isDetailView = !!assignmentId;

    useEffect(() => {
        if (isDetailView && assignmentId) {
            const loadAssignment = async () => {
                try {
                    setLoading(true);
                    const data = await getAssignmentById(assignmentId);
                    setAssignment(data);
                } catch (err) {
                    setError(err.message || "Ошибка загрузки задания");
                    router.push(
                        `/assignments/students-assignments${currentTaskId ? `?taskId=${currentTaskId}` : ""}`,
                    );
                } finally {
                    setLoading(false);
                }
            };
            loadAssignment();
        }
    }, [assignmentId, isDetailView, router, currentTaskId]);

    const handleSelectAssignment = (assignment) => {
        if (assignment && assignment.id) {
            router.push(
                `/assignments/students-assignments/${assignment.id}${currentTaskId ? `?taskId=${currentTaskId}` : ""}`,
            );
        }
    };

    const handleBackToList = () => {
        router.push(
            `/assignments/students-assignments${currentTaskId ? `?taskId=${currentTaskId}` : ""}`,
        );
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text color="danger">{error}</Text>;

    return (
        <div className="instructor-assignment-flow">
            {!isDetailView ? (
                <>
                    <InstructorStudentsList
                        onSelectAssignment={handleSelectAssignment}
                        taskId={currentTaskId}
                    />
                </>
            ) : (
                <>
                    <MyButton
                        text="Назад к списку"
                        onClick={handleBackToList}
                        className={buttonStyles.backButton}
                    />
                    <InstructorAssignmentDetail
                        assignmentId={assignmentId}
                        userId={assignment?.user_id}
                    />
                </>
            )}
        </div>
    );
};
