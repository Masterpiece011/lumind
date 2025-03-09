import { Router } from "express";

const notificationRouter = Router();

notificationRouter.post("/");
notificationRouter.get("/:id");
notificationRouter.get("/");

notificationRouter.put("/");

export default notificationRouter;
