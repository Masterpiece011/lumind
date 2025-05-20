import { $authHost } from "./page";

export const getAllTeamPublications = async ({ teamId }) => {
    const response = await $authHost.post(
        "api/publications/team-publications",
        { team_id: teamId },
    );

    return response;
};
