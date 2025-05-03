import { Router } from "express";
const router = Router();

import fileController from "../controllers/fileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.get("/user", authMiddleware, fileController.getUserFiles);

export default router;
