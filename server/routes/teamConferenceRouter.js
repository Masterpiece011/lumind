import { Router } from "express";

const teamConferenceRouter = Router();

import teamConferenceController from "../controllers/teamConferenceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

teamConferenceRouter.post("/", authMiddleware, teamConferenceController.create);
teamConferenceRouter.get(
    "/:id",
    authMiddleware,
    teamConferenceController.getOne
);
teamConferenceRouter.get(
    "/",
    authMiddleware,
    roleMiddleware(),
    teamConferenceController.getAll
);

teamConferenceRouter.put("/", authMiddleware, teamConferenceController.update);

export default teamConferenceRouter;
