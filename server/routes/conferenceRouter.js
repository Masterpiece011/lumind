import { Router } from "express";

const conferenceRouter = Router();

import conferenceController from "../controllers/conferenceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

conferenceRouter.post("/", authMiddleware, conferenceController.create);
conferenceRouter.get("/:id", authMiddleware, conferenceController.getOne);
conferenceRouter.get(
    "/",
    roleMiddleware(),
    authMiddleware,
    conferenceController.getAll
);

conferenceRouter.put("/", authMiddleware, conferenceController.update);

export default conferenceRouter;
