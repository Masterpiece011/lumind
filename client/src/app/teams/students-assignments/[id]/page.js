"use client";
import { InstructorAssignmentDetail } from "@/features/instructor/ui/InstructorDetail/InstructorAssignmentDetail";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();

    return (
        <InstructorAssignmentDetail
            assignmentId={params.assignmentId}
            teamId={params.teamId}
        />
    );
}
