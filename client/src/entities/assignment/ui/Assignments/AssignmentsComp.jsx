import React, { useEffect, useState, memo, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { Filters } from "../Filters";
import { AssignmentsList } from "../AssignmentsList";
import "./AssignmentsComp.scss";
import Text from "@/shared/ui/Text";
import {
    getInstructorAssignments,
    getUserAssignments,
} from "@/shared/api/assignmentsAPI";
import { useRouter } from "next/navigation";
import { MyButton } from "@/shared/uikit/MyButton";

const AssignmentsPage = memo(({ userId }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);
    const isInstructor = currentUser?.role === "INSTRUCTOR";

    const assignmentsState = useSelector((state) =>
        isInstructor
            ? state.assignments.instructorAssignments
            : state.assignments.userAssignments,
    );

    const {
        data: allAssignments = isInstructor
            ? { assignmentsByTask: [], total: 0 }
            : [],
        loading,
        error,
    } = assignmentsState;

    const [filter, setFilter] = useState("all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    // Подготовка данных
    const { preparedAssignments, totalToShow } = useMemo(() => {
        if (isInstructor) {
            const assignmentsByTask = allAssignments.assignmentsByTask || [];
            const taskCards = [];
            let totalAssignments = 0;

            assignmentsByTask.forEach((taskGroup) => {
                const assignments = taskGroup.assignments || [];
                const filteredAssignments =
                    filter === "all"
                        ? assignments
                        : assignments.filter((a) => a.status === filter);

                if (filteredAssignments.length > 0) {
                    taskCards.push({
                        id: taskGroup.task.id,
                        task: taskGroup.task,
                        status: "assigned",
                        isInstructorView: true,
                        assignmentsCount: filteredAssignments.length,
                        team: taskGroup.team,
                    });
                    totalAssignments += filteredAssignments.length;
                }
            });

            return {
                preparedAssignments: taskCards,
                totalToShow: totalAssignments,
            };
        } else {
            const assignments = Array.isArray(allAssignments)
                ? allAssignments
                : [];

            // Фильтрация с учетом реальных статусов из API
            const filtered = assignments.filter((assignment) => {
                if (filter === "all") return true;

                // Приводим статусы к единому формату
                const statusMap = {
                    assigned: "assigned",
                    submitted: "submitted",
                    completed: "completed",
                    failed: "failed",
                    in_progress: "in_progress",
                };

                const normalizedStatus =
                    statusMap[assignment.status] || assignment.status;
                return normalizedStatus === filter;
            });

            return {
                preparedAssignments: filtered,
                totalToShow: filtered.length,
            };
        }
    }, [allAssignments, filter, isInstructor]);

    // Остальной код без изменений
    const handleSelectAssignment = useCallback(
        (taskId) => {
            if (!taskId) return;
            router.push(
                isInstructor
                    ? `/assignments/students-assignments?taskId=${taskId}`
                    : `/assignments/${taskId}`,
            );
        },
        [isInstructor, router],
    );

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setIsFilterLoading(true);
            try {
                if (isInstructor) {
                    await dispatch(getInstructorAssignments(userId));
                } else {
                    await dispatch(getUserAssignments({ userId }));
                }
            } finally {
                setIsFilterLoading(false);
            }
        };

        fetchData();
    }, [dispatch, userId, isInstructor]);

    const handleSetNewFilter = useCallback((newFilter) => {
        setFilter(newFilter);
    }, []);

    if (loading) return <ClockLoader className="assignments__loading" />;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    return (
        <div className="assignments">
            <div className="assignments__header">
                <Text tag="h1" className="assignments__title">
                    {isInstructor ? "Мои задания" : "Назначенные задания"}
                </Text>
                {isInstructor && (
                    <MyButton
                        text="Создать назначение"
                        onClick={() => router.push("/assignments/create")}
                    />
                )}
            </div>

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
                    assignments={preparedAssignments}
                    assignmentsTotal={totalToShow}
                    onSelect={handleSelectAssignment}
                    isFilterLoading={isFilterLoading}
                />
            )}
        </div>
    );
});

export { AssignmentsPage };
