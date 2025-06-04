"use client";
import { InstructorAssignmentFlow } from "@/features/instructor";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();
    const taskId = searchParams.get("taskId");

    return <InstructorAssignmentFlow taskId={taskId} />;
}
