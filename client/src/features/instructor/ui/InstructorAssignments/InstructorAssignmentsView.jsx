"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAssignments } from "@/shared/api/assignmentsAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { AssignmentsList } from "../AssignmentsList";
import Text from "@/shared/ui/Text";
import { InstructorStudentsList } from "./InstructorStudentsList";
import "./InstructorAssignmentsView.scss";

export const InstructorAssignmentsView = ({ userId }) => {
    const dispatch = useDispatch();
    const { assignments, loading, error } = useSelector(
        (state) => state.assignments,
    );
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (selectedUserId) {
            dispatch(
                getAssignments({
                    user_id: selectedUserId,
                    creator_id: userId,
                    status: filter === "all" ? undefined : filter,
                    include: ["task", "files"],
                }),
            );
        }
    }, [dispatch, userId, selectedUserId, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    if (loading) return <ClockLoader />;
    if (error) return <Text tag="p">Ошибка: {error}</Text>;

    return (
        <div className="instructor-assignments">
            <InstructorStudentsList onSelectUser={setSelectedUserId} />

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
