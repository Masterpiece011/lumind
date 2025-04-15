"use client";

import { TeamDetailPage } from "@/entities/team/ui/TeamDetail";

export default function TeamPage({ params }) {
    return <TeamDetailPage teamId={params.id} />;
}
