import { Router } from "express";

const submissionRouter = Router();

import submissionController from "../controllers/submissionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

submissionRouter.post(
    "/",
    authMiddleware,
    roleMiddleware(),
    submissionController.create
);
submissionRouter.get("/:id", authMiddleware, submissionController.getOne);
submissionRouter.get("/", authMiddleware, submissionController.getAll);
submissionRouter.delete(
    "/",
    authMiddleware,
    roleMiddleware(),
    submissionController.delete
);

submissionRouter.put(
    "/",
    authMiddleware,
    roleMiddleware(),
    submissionController.update
);

export default submissionRouter;
