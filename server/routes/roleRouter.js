import { Router } from "express";

const roleRouter = Router();

import roleController from "../controllers/roleController.js";

roleRouter.post("/", roleController.create);
roleRouter.get("/", roleController.getAll);

export default roleRouter;
