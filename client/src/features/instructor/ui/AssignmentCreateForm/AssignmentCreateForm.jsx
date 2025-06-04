"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    createAssignment,
    getInstructorAssignments,
} from "@/shared/api/assignmentsAPI";
import { MyButton } from "@/shared/uikit/MyButton";
import Text from "@/shared/ui/Text";
import "./AssignmentCreateForm.scss";
import { useSelector, useDispatch } from "react-redux";
import { getTeams } from "@/shared/api/teamAPI";
import { getTasks } from "@/shared/api/taskAPI";
import { ClockLoader } from "@/shared/ui/Loaders/ClockLoader";
import { useFilteredUsers } from "@/entities/user/model/useFilteredUsers";
import { formatUserName } from "@/shared/lib/utils/formatUserName";
import { addAssignment } from "@/entities/assignment/model/assignmentStore";

export const AssignmentCreateForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);

    const {
        filteredUsers: students,
        isLoading: usersLoading,
        error: usersError,
    } = useFilteredUsers("users", "");

    const { teams } = useSelector((state) => state.teams);

    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({
        user_id: "",
        task_id: "",
        team_id: "",
        due_date: "",
    });
    const [loading, setLoading] = useState({
        teams: true,
        tasks: true,
        submit: false,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeamsAndTasks = async () => {
            try {
                await dispatch(getTeams());
                const tasksResponse = await getTasks();
                setTasks(tasksResponse?.tasks?.tasks || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Ошибка загрузки данных");
            } finally {
                setLoading((prev) => ({
                    ...prev,
                    teams: false,
                    tasks: false,
                }));
            }
        };
        fetchTeamsAndTasks();
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading((prev) => ({ ...prev, submit: true }));

        try {
            const payload = {
                user_id: formData.user_id,
                task_id: formData.task_id,
                creator_id: currentUser.id,
                plan_date: formData.due_date || null,
                status: "assigned",
                team_id: formData.team_id || null,
            };

            const response = await createAssignment(payload);

            // Оптимистичное обновление
            const selectedTask = tasks.find((t) => t.id === formData.task_id);
            const selectedStudent = students.find(
                (s) => s.id === formData.user_id,
            );
            const selectedTeam = teams.find((t) => t.id === formData.team_id);

            dispatch(
                addAssignment({
                    assignment: {
                        ...response.assignment,
                        task: selectedTask,
                        user: selectedStudent,
                        team: selectedTeam,
                    },
                }),
            );

            router.push("/assignments");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading((prev) => ({ ...prev, submit: false }));
        }
    };

    const isLoading = loading.teams || loading.tasks || usersLoading;

    return (
        <div className="assignment-create">
            <Text tag="h1" className="assignment-create__title">
                Создание назначения
            </Text>

            {isLoading && <ClockLoader />}

            <form onSubmit={handleSubmit} className="assignment-create__form">
                <div className="assignment-create__group">
                    <label>Студент*</label>
                    <select
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleChange}
                        required
                        disabled={isLoading || students.length === 0}
                    >
                        <option value="">Выберите студента</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {formatUserName(student)}
                            </option>
                        ))}
                    </select>
                    {students.length === 0 && !usersLoading && (
                        <Text color="danger">Нет доступных студентов</Text>
                    )}
                    {usersError && <Text color="danger">{usersError}</Text>}
                </div>

                <div className="assignment-create__group">
                    <label>Команда</label>
                    <select
                        name="team_id"
                        value={formData.team_id}
                        onChange={handleChange}
                        disabled={isLoading || teams.length === 0}
                    >
                        <option value="">
                            Выберите команду (необязательно)
                        </option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                    {teams.length === 0 && !loading.teams && (
                        <Text color="danger">Нет доступных команд</Text>
                    )}
                </div>

                <div className="assignment-create__group">
                    <label>Задание*</label>
                    <select
                        name="task_id"
                        value={formData.task_id}
                        onChange={handleChange}
                        required
                        disabled={isLoading || tasks.length === 0}
                    >
                        <option value="">Выберите задание</option>
                        {tasks.map((task) => (
                            <option key={task.id} value={task.id}>
                                {task.title}
                            </option>
                        ))}
                    </select>
                    {tasks.length === 0 && !loading.tasks && (
                        <Text color="danger">Нет доступных заданий</Text>
                    )}
                </div>

                <div className="assignment-create__group">
                    <label>Срок выполнения</label>
                    <input
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        disabled={isLoading}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>

                {error && (
                    <div className="assignment-create__error">
                        <Text color="danger">{error}</Text>
                    </div>
                )}

                <div className="assignment-create__actions">
                    <MyButton
                        type="button"
                        text="Отмена"
                        onClick={() => router.back()}
                        variant="outlined"
                        disabled={isLoading || loading.submit}
                    />
                    <MyButton
                        type="submit"
                        text={
                            loading.submit
                                ? "Создание..."
                                : "Создать назначение"
                        }
                        disabled={
                            isLoading ||
                            loading.submit ||
                            !formData.user_id ||
                            !formData.task_id
                        }
                    />
                </div>
            </form>
        </div>
    );
};
