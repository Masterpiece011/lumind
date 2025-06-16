import { Router } from "express";

const chatRouter = Router();

// import assignmentController from "../controllers/assignmentController.js";

import chatController from "../controllers/chats/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";

chatRouter.post("/create", authMiddleware, chatController.createChat);

chatRouter.post("/get-all", authMiddleware, chatController.getAllUserChats);

chatRouter.post("/:id", authMiddleware, chatController.getChatHistory);

chatRouter.post("/", authMiddleware, chatController.getAllChats);

export default chatRouter;
