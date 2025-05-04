import { Router } from "express";
const router = Router();

import fileController from "../controllers/fileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.post("/user", authMiddleware, fileController.getUserFiles);
//router.post("/team/:teamId", authMiddleware, fileController.getTeamFiles);
export default router;
