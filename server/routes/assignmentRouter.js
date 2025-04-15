import { Router } from "express";

const assignmentRouter = Router();

import assignmentController from "../controllers/assignmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

assignmentRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    assignmentController.create
);
assignmentRouter.get("/:id", authMiddleware, assignmentController.getOne);
assignmentRouter.post("/", authMiddleware, assignmentController.getAll);
assignmentRouter.put(
    "/",
    authMiddleware,
    roleMiddleware(),
    assignmentController.update
);
assignmentRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    assignmentController.delete
);

export default assignmentRouter;
