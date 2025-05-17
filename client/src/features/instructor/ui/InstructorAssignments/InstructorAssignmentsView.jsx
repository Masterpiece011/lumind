"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { AssignmentsList } from "../AssignmentsList";
import Text from "@/shared/ui/Text";
import { InstructorStudentsList } from "./InstructorStudentsList";
import { MyButton } from "@/shared/uikit/MyButton";
import { ASSIGNMENTS_STATUSES } from "@/shared/constants";
import "./InstructorAssignmentsView.scss";
import { getUserAssignments } from "@/shared/api/assignmentsAPI";

export const InstructorAssignmentsView = ({ userId, taskId }) => {
    const dispatch = useDispatch();
    const { assignments, loading, error } = useSelector(
        (state) => state.assignments.userAssignments,
    );
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (selectedUserId) {
            dispatch(
                getUserAssignments({
                    userId: selectedUserId,
                    status: filter === "all" ? undefined : filter,
                    include: ["task", "files"],
                }),
            );
        }
    }, [dispatch, selectedUserId, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;

    return (
        <div className="instructor-assignments">
            <div className="students-container">
                <InstructorStudentsList
                    taskId={taskId}
                    onSelectUser={setSelectedUserId}
                />
            </div>

            {selectedUserId && (
                <div className="assignments-section">
                    <div className="filters">
                        <MyButton
                            text="Все"
                            active={filter === "all"}
                            onClick={() => handleFilterChange("all")}
                        />
                        <MyButton
                            text="На проверку"
                            active={filter === ASSIGNMENTS_STATUSES.SUBMITTED}
                            onClick={() =>
                                handleFilterChange(
                                    ASSIGNMENTS_STATUSES.SUBMITTED,
                                )
                            }
                        />
                        <MyButton
                            text="Завершенные"
                            active={filter === ASSIGNMENTS_STATUSES.COMPLETED}
                            onClick={() =>
                                handleFilterChange(
                                    ASSIGNMENTS_STATUSES.COMPLETED,
                                )
                            }
                        />
                    </div>

                    <AssignmentsList
                        assignments={assignments}
                        isInstructor={true}
                    />
                </div>
            )}
        </div>
    );
};
