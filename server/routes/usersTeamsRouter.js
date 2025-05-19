import { Router } from "express";

const userTeamsRouter = Router();

import usersTeamsController from "../controllers/users-teams/usersTeamsController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

userTeamsRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    usersTeamsController.create
);
userTeamsRouter.post("/", authMiddleware, usersTeamsController.getAll);
userTeamsRouter.get("/id", authMiddleware, usersTeamsController.getOne);
userTeamsRouter.put(
    "/",
    authMiddleware,
    roleMiddleware(),
    usersTeamsController.update
);
userTeamsRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    usersTeamsController.delete
);

export default userTeamsRouter;
