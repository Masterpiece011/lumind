import { Router } from "express";

const assignmentRouter = Router();

import assignmentController from "../controllers/assignmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

assignmentRouter.post(
    "/",
    authMiddleware,
    roleMiddleware(),
    assignmentController.create
);
assignmentRouter.get("/:id", authMiddleware, assignmentController.getOne);
assignmentRouter.get("/", authMiddleware, assignmentController.getAll);
assignmentRouter.delete(
    "/",
    authMiddleware,
    roleMiddleware(),
    assignmentController.delete
);

assignmentRouter.put(
    "/",
    authMiddleware,
    roleMiddleware(),
    assignmentController.update
);

export default assignmentRouter;
