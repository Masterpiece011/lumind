"use client";

import { InstructorStudentsList } from "@/features/instructor/ui/InstructorList/InstructorStudentsList";
import { useSearchParams, useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const searchParams = useSearchParams();
    const taskId = searchParams.get("taskId");

    return <InstructorStudentsList taskId={taskId} teamId={params.teamId} />;
}
