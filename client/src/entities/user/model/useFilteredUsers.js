"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "@/shared/api/userAPI";

export const useFilteredUsers = (filter, searchQuery) => {
    const dispatch = useDispatch();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const allUsers = useSelector((state) => state.users.users) || [];
    const currentUser = useSelector((state) => state.user.user);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                let roleFilter = "";
                let groupFilter = null;

                if (filter === "instructors") roleFilter = "INSTRUCTOR";
                if (filter === "users") roleFilter = "USER";
                if (filter === "teams" && currentUser?.group_id) {
                    groupFilter = currentUser.group_id;
                }

                const search_text = searchQuery || "";

                await dispatch(
                    getUsers({
                        page: 1,
                        quantity: 100,
                        search_text,
                        ...(roleFilter && { role: roleFilter }),
                        ...(groupFilter && { group_id: groupFilter }),
                    }),
                );
            } catch (err) {
                setError(err.message);
                console.error("Error fetching users:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch, filter, searchQuery, currentUser?.group_id]);

    useEffect(() => {
        const result = allUsers.filter((user) => {
            if (user.role.name === "ADMIN" || user.role.name === "MODERATOR") {
                return false;
            }

            if (filter === "group") {
                return (
                    currentUser?.group_id &&
                    user.group_id === currentUser.group_id
                );
            }

            return true;
        });

        setFilteredUsers(result);
    }, [allUsers, filter, currentUser?.group_id]);

    return { filteredUsers, isLoading, error };
};
