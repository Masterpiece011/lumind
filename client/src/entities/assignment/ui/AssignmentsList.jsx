import React, { memo } from "react";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { AssignmentCard } from "./AssignmentCard";

export const AssignmentsList = memo(
    ({
        assignments,
        assignmentsTotal,
        isLoading,
        isFilterLoading,
        onSelect,
    } ) => (
        
        <ul className="assignments__cards-list">
            {isLoading || isFilterLoading ? (
                <div className="assignments__loading">
                    <ClockLoader loading={true} />
                </div>
            ) : assignmentsTotal > 0 ? (
                assignments.map((assignment) => (
                    <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        status={assignment.status}
                        onSelect={onSelect}
                    />
                ))
            ) : (
                <p className="assignments__empty"></p>
            )}
        </ul>
    ),
);
