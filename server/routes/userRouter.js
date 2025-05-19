import { Router } from "express";

const userRouter = Router();

import userController from "../controllers/users/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

userRouter.post(
    "/registration",
    authMiddleware,
    roleMiddleware(),
    userController.registration
);
userRouter.post("/login", userController.login);
userRouter.get("/auth", authMiddleware, userController.check);
userRouter.post("/", authMiddleware, userController.getAll);
userRouter.get("/:id", authMiddleware, userController.getOne);
userRouter.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(),
    userController.delete
);

userRouter.put("/", authMiddleware, roleMiddleware(), userController.update);

export default userRouter;
