import { Router } from "express";

const roleRouter = Router();

import roleController from "../controllers/roles/roleController.js";

roleRouter.post("/", roleController.create);
roleRouter.get("/", roleController.getAll);

export default roleRouter;
