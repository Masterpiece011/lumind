import { Router } from "express";

const teamsTasksRouter = Router();

import usersTeamsController from "../controllers/usersTeamsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

teamsTasksRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    usersTeamsController.create
);
teamsTasksRouter.post("/", authMiddleware, usersTeamsController.getAll);
teamsTasksRouter.get("/:id", authMiddleware, usersTeamsController.getOne);
teamsTasksRouter.put(
    "/",
    authMiddleware,
    roleMiddleware(),
    usersTeamsController.update
);
teamsTasksRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    usersTeamsController.delete
);

export default teamsTasksRouter;
