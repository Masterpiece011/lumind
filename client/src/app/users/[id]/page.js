"use client";
import { UserDetailPage } from "@/entities/user/ui/UserDetail";
import { useRouter } from "next/navigation";

export default function UserPage({ params }) {
    const router = useRouter();
    return <UserDetailPage userId={params.id} onClose={() => router.back()} />;
}
