import { useEffect, useState } from "react";

export const useSearchFilter = (searchQuery, usersArray, teams, userFiles) => {
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);

    useEffect(() => {
        const query = searchQuery.toLowerCase();

        setFilteredUsers(
            usersArray.filter(
                (user) =>
                    user.email.toLowerCase().includes(query) ||
                    user.name?.toLowerCase().includes(query),
            ),
        );

        setFilteredTeams(
            teams.filter(
                (team) =>
                    team.name.toLowerCase().includes(query) ||
                    team.description?.toLowerCase().includes(query),
            ),
        );

        setFilteredFiles(
            userFiles.filter(
                (file) =>
                    file.file_url.toLowerCase().includes(query) ||
                    file.assignmentTitle?.toLowerCase().includes(query),
            ),
        );
    }, [searchQuery, usersArray, teams, userFiles]);

    return { filteredUsers, filteredTeams, filteredFiles };
};
