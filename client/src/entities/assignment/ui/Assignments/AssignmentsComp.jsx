import React, { useEffect, useState, memo, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { Filters } from "../Filters";
import { AssignmentsList } from "../AssignmentsList";

import "./AssignmentsComp.scss";
import * as buttonStyles from "@/shared/uikit/MyButton/MyButton.module.scss";

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
    const isAuth = useSelector((state) => state.user.isAuth);
    const isInstructor = currentUser?.role === "INSTRUCTOR";

    if (!isAuth) {
        return null;
    }

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

    const [filter, setFilter] = useState(isInstructor ? "all" : "all");
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    const { preparedAssignments, totalToShow } = useMemo(() => {
        if (isInstructor) {
            const assignmentsByTask = allAssignments.assignmentsByTask || [];
            const taskCards = [];
            let totalAssignments = 0;

            const taskTeamsMap = new Map();

            assignmentsByTask.forEach((taskGroup) => {
                const taskId = taskGroup.task.id;

                if (!taskTeamsMap.has(taskId)) {
                    taskTeamsMap.set(taskId, {
                        task: taskGroup.task,
                        teams: [],
                        totalAssignments: 0,
                    });
                }

                const taskData = taskTeamsMap.get(taskId);
                taskData.teams.push({
                    team: taskGroup.team,
                    assignmentsCount: taskGroup.assignments?.length || 0,
                });
                taskData.totalAssignments += taskGroup.assignments?.length || 0;
            });

            taskTeamsMap.forEach((taskData, taskId) => {
                taskCards.push({
                    id: taskId,
                    task: taskData.task,
                    isInstructorView: true,
                    teams: taskData.teams,
                    totalAssignments: taskData.totalAssignments,
                    team: taskData.teams[0]?.team,
                });
                totalAssignments += taskData.totalAssignments;
            });

            return {
                preparedAssignments: taskCards,
                totalToShow: totalAssignments,
            };
        } else {
            const assignments = Array.isArray(allAssignments)
                ? allAssignments
                : [];

            const filtered = assignments.filter((assignment) => {
                if (filter === "all") return true;

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

            const assignmentsWithTeam = filtered.map((assignment) => ({
                ...assignment,
                team: assignment.team || null,
            }));

            return {
                preparedAssignments: assignmentsWithTeam,
                totalToShow: assignmentsWithTeam.length,
            };
        }
    }, [allAssignments, filter, isInstructor]);

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

    const handleSetNewFilter = useCallback(
        (newFilter) => {
            if (!isInstructor) {
                setFilter(newFilter);
            }
        },
        [isInstructor],
    );

    if (loading) return <ClockLoader className="assignments__loading" />;
    if (error) return <div className="assignments__error">Ошибка: {error}</div>;

    return (
        <div className="assignments">
            <div className="assignments__header">
                <Text tag="h1" className="assignments__title">
                    {isInstructor ? "Мои задания" : "Назначенные задания"}
                </Text>
                {isInstructor && (
                    <div className="assignments__header-actions">
                        <MyButton
                            text="Создать задание"
                            onClick={() =>
                                router.push("/assignments/create-task")
                            }
                            className={buttonStyles.assignmentsButton}
                        />
                        <MyButton
                            text="Создать назначение"
                            onClick={() => router.push("/assignments/create")}
                            className={`${buttonStyles.assignmentsButton} ${buttonStyles.assignmentsButtonOutlined}`}
                            variant="outlined"
                        />
                    </div>
                )}
            </div>

            {!isInstructor && (
                <>
                    <Filters
                        currentFilter={filter}
                        onFilterChange={handleSetNewFilter}
                    />
                    <div className="assignments__divider"></div>
                </>
            )}

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
