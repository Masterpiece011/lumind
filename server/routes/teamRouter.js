import { Router } from "express";

const teamRouter = new Router();

import teamController from "../controllers/teams/teamController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

teamRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    teamController.create
);
teamRouter.get("/:id", authMiddleware, teamController.getOne);
teamRouter.post("/", authMiddleware, teamController.getAll);
teamRouter.post(
    "/instructor/assignments",
    authMiddleware,
    roleMiddleware(),
    teamController.getTeamInstructorAssignments
);

teamRouter.post(
    "/students-with-assignments",
    authMiddleware,
    roleMiddleware(),
    teamController.getTeamStudentsWithAssignments
);

teamRouter.put("/", authMiddleware, roleMiddleware(), teamController.update);
teamRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    teamController.delete
);

export default teamRouter;
