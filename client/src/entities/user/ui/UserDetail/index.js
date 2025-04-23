"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserById } from "@/shared/api/userAPI";
import { UserModal } from "@/entities/user/ui/Profile";

export const UserDetailPage = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserById(userId);
                setUser(userData);
            } catch (error) {
                console.error("Ошибка загрузки пользователя:", error);
                router.push("/users");
            }
        };
        fetchUser();
    }, [userId, router]);

    if (!user) return null;

    return <UserModal user={user} onClose={onClose} />;
};
