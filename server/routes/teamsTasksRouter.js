import { Router } from "express";

const teamsTasksRouter = Router();

import TeamsTasksController from "../controllers/teams-tasks/teamsTasksController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

teamsTasksRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    TeamsTasksController.create
);
teamsTasksRouter.post("/", authMiddleware, TeamsTasksController.getAll);
teamsTasksRouter.get("/:id", authMiddleware, TeamsTasksController.getOne);
teamsTasksRouter.put(
    "/",
    authMiddleware,
    roleMiddleware(),
    TeamsTasksController.update
);
teamsTasksRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    TeamsTasksController.delete
);

export default teamsTasksRouter;
