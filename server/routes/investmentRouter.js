import { Router } from "express";

const investmentRouter = new Router();

investmentRouter.post("/");
investmentRouter.get("/:id");
investmentRouter.get("/");

investmentRouter.put("/");

export default investmentRouter;
