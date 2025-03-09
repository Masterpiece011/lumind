import { Router } from "express";

const publicationRouter = Router();

import publicationController from "../controllers/publicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

publicationRouter.post("/", authMiddleware, publicationController.create);
publicationRouter.get("/:id", authMiddleware, publicationController.getOne);
publicationRouter.get("/", authMiddleware, publicationController.getAll);
publicationRouter.delete("/", authMiddleware, publicationController.delete);

publicationRouter.put("/", authMiddleware, publicationController.update);

export default publicationRouter;
