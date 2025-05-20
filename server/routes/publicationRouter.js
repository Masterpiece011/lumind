import { Router } from "express";

const publicationRouter = Router();

import publicationController from "../controllers/publications/publicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

publicationRouter.post("/create", authMiddleware, publicationController.create);
publicationRouter.get("/:id", authMiddleware, publicationController.getOne);
publicationRouter.get("/", authMiddleware, publicationController.getAll);
publicationRouter.post(
    "/team-publications",
    authMiddleware,
    publicationController.getTeamPublications
);
publicationRouter.delete("/:id", authMiddleware, publicationController.delete);

publicationRouter.put("/", authMiddleware, publicationController.update);

export default publicationRouter;
