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
assignmentRouter.post(
    "/",
    authMiddleware,
    roleMiddleware(),
    assignmentController.getAll
);
assignmentRouter.post(
    "/get-self",
    authMiddleware,
    roleMiddleware(),
    assignmentController.getAllSelfAssignments
);
assignmentRouter.post(
    "/get-team-assignments",
    authMiddleware,
    roleMiddleware(),
    assignmentController.getAllSelfTeamAssignments
);
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

assignmentRouter.get(
    "/instructor/students",
    authMiddleware,
    roleMiddleware(),
    assignmentController.getStudentsWithAssignments
);

assignmentRouter.get(
    "/instructor/assignment/:id",
    authMiddleware,
    roleMiddleware(),
    assignmentController.getStudentAssignment
);

export default assignmentRouter;
