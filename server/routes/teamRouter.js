import { Router } from "express";

const teamRouter = new Router();

import teamController from "../controllers/teamController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

teamRouter.post("/", authMiddleware, roleMiddleware(), teamController.create);
teamRouter.get("/:id", teamController.getOne);
teamRouter.get("/", teamController.getAll);
teamRouter.delete("/", authMiddleware, roleMiddleware(), teamController.delete);

teamRouter.put("/", authMiddleware, roleMiddleware(), teamController.update);

export default teamRouter;
