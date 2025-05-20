import React, { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { Filters } from "../Filters";
import { AssignmentsList } from "../AssignmentsList";
import "./AssignmentsComp.scss";
import Text from "@/shared/ui/Text";
import { getUserAssignments } from "@/shared/api/assignmentsAPI";
import { useRouter } from "next/navigation";

const AssignmentsPage = memo(({ userId, onSelectAssignment }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        data: allAssignments,
        total: assignmentsTotal,
        loading,
        error,
    } = useSelector((state) => state.assignments.userAssignments);

    const [filter, setFilter] = useState("all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);
    const [filteredAssignments, setFilteredAssignments] = useState([]);

    const userRole = useSelector((state) => state.user.user?.role);
    const isInstructor = userRole === "INSTRUCTOR";
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    const handleSelectAssignment = (assignmentId) => {
        if (isInstructor) {
            router.push(
                `/assignments/students-assignments?assignmentId=${assignmentId}`,
            );
        } else {
            router.push(`/assignments/${assignmentId}`);
        }
    };

    useEffect(() => {
        if (allAssignments) {
            if (filter === "all") {
                setFilteredAssignments(allAssignments);
            } else {
                setFilteredAssignments(
                    allAssignments.filter((a) => a.status === filter),
                );
            }
        }
    }, [allAssignments, filter]);

    useEffect(() => {
        if (userId) {
            setIsFilterLoading(true);
            dispatch(getUserAssignments({ userId })).finally(() =>
                setIsFilterLoading(false),
            );
        }
    }, [dispatch, userId]);

    const handleSetNewFilter = (newFilter) => {
        setFilter(newFilter);
    };

    if (loading) return <ClockLoader className="assignments__loading" />;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    return (
        <div className="assignments">
            <Text tag="h1" className="assignments__title">
                Мои задания
            </Text>

            <Filters
                currentFilter={filter}
                onFilterChange={handleSetNewFilter}
            />

            <div className="assignments__divider"></div>

            {isFilterLoading ? (
                <div className="assignments__loader">
                    <ClockLoader loading={true} />
                </div>
            ) : (
                <AssignmentsList
                    assignments={filteredAssignments}
                    assignmentsTotal={
                        filter === "all"
                            ? assignmentsTotal
                            : filteredAssignments.length
                    }
                    onSelect={handleSelectAssignment}
                    isLoading={loading}
                    isFilterLoading={isFilterLoading}
                />
            )}
        </div>
    );
});

export { AssignmentsPage };
