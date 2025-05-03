import { useMemo } from "react";

export const useSearchFilter = (searchQuery, usersArray, teams, userFiles) => {
    return useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return {
                filteredUsers: usersArray,
                filteredTeams: teams,
                filteredFiles: userFiles || [],
            };
        }

        // Фильтрация пользователей
        const filteredUsers = usersArray.filter((user) => {
            const searchFields = [
                user.email,
                user.first_name,
                user.last_name,
                user.middle_name,
                user.name,
            ]
                .filter(Boolean)
                .map((f) => f.toLowerCase());
            return searchFields.some((field) => field.includes(query));
        });

        // Фильтрация команд
        const filteredTeams = teams.filter((team) => {
            const searchFields = [team.name, team.description]
                .filter(Boolean)
                .map((f) => f.toLowerCase());
            return searchFields.some((field) => field.includes(query));
        });

        // Фильтрация файлов
        const filteredFiles = userFiles.filter((file) => {
            const searchFields = [
                file.file_url,
                file.original_name || file.file_url.split("/").pop(),
                file.assignmentTitle,
                file.taskTitle,
            ]
                .filter(Boolean)
                .map((f) => f.toLowerCase());
            return searchFields.some((field) => field.includes(query));
        });

        return { filteredUsers, filteredTeams, filteredFiles };
    }, [searchQuery, usersArray, teams, userFiles]);
};
