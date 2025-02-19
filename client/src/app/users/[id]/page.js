"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserById } from "@/app/api/userAPI";
import { UserModal } from "@/app/components/views/Profile";

const UserDetailPage = ({ params }) => {
    const { id } = params;
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserById(id);
                setUser(userData);
            } catch (error) {
                console.error("Ошибка загрузки пользователя:", error);
                router.push("/users");
            }
        };

        fetchUser();
    }, [id, router]);

    if (!user) return null;

    return <UserModal user={user} onClose={() => router.back()} />;
};

export default UserDetailPage;
