"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { MyButton } from "@/shared/uikit/MyButton";
import "./InstructorAssignmentFlow.scss";
import Text from "@/shared/ui/Text";
import { getAssignmentById } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { InstructorStudentsList } from "../InstructorList/InstructorStudentsList";
import { InstructorAssignmentDetail } from "../InstructorDetail/InstructorAssignmentDetail";

export const InstructorAssignmentFlow = () => {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();

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
                    router.push("/assignments/students-assignments");
                } finally {
                    setLoading(false);
                }
            };
            loadAssignment();
        }
    }, [assignmentId, isDetailView, router]);

    const handleSelectAssignment = (assignment) => {
        router.push(`/assignments/students-assignments/${assignment.id}`);
    };

    const handleBackToList = () => {
        router.push("/assignments/students-assignments");
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text color="danger">{error}</Text>;

    return (
        <div className="instructor-assignment-flow">
            {!isDetailView ? (
                <>
                    <InstructorStudentsList
                        onSelectAssignment={handleSelectAssignment}
                    />
                </>
            ) : (
                <>
                    <MyButton
                        text="Назад к списку"
                        onClick={handleBackToList}
                        className="back-button"
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
