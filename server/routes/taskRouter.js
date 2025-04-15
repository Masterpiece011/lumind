import { Router } from "express";

const taskRouter = new Router();

import taskController from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

taskRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    taskController.create
);
taskRouter.get("/:id", authMiddleware, taskController.getOne);
taskRouter.post("/", authMiddleware, taskController.getAll);
taskRouter.put("/", authMiddleware, roleMiddleware(), taskController.update);
taskRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    taskController.delete
);

export default taskRouter;
