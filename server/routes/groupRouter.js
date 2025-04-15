import { Router } from "express";

const groupRouter = Router();

import groupController from "../controllers/groupController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

groupRouter.post(
    "/create",
    authMiddleware,
    roleMiddleware(),
    groupController.create
);
groupRouter.get("/:id", groupController.getOne);
groupRouter.post("/", groupController.getAll);
groupRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    groupController.delete
);

groupRouter.put("/", authMiddleware, roleMiddleware(), groupController.update);

export default groupRouter;
