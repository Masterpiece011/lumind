import { Router } from "express";

const commentRouter = new Router();

commentRouter.post("/");
commentRouter.get("/:id");
commentRouter.get("/");

commentRouter.put("/");

export default commentRouter;
