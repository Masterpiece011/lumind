import { useEffect, useState } from "react";

export const useSearchFilter = (searchQuery, usersArray, teams, userFiles) => {
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            setFilteredUsers(usersArray);
            setFilteredTeams(teams);
            setFilteredFiles(userFiles);
            return;
        }

        // Для пользователей
        setFilteredUsers(
            usersArray.filter((user) => {
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
            }),
        );

        // Для команд
        setFilteredTeams(
            teams.filter((team) => {
                const searchFields = [team.name, team.description]
                    .filter(Boolean)
                    .map((f) => f.toLowerCase());

                return searchFields.some((field) => field.includes(query));
            }),
        );

        // Для файлов
        setFilteredFiles(
            userFiles.filter((file) => {
                const searchFields = [
                    file.file_url,
                    file.original_name,
                    file.assignmentTitle,
                ]
                    .filter(Boolean)
                    .map((f) => f.toLowerCase());

                return searchFields.some((field) => field.includes(query));
            }),
        );
    }, [searchQuery, usersArray, teams, userFiles]);

    return { filteredUsers, filteredTeams, filteredFiles };
};
