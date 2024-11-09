const Router = require("express");
const router = new Router();

const userRouter = require("./userRouter");
const roleRouter = require("./roleRouter");
const groupRouter = require("./groupRouter");
const notificationRouter = require("./notificationRouter");
const assignmentRouter = require("./assignmentRouter");
const publicationRouter = require("./publicationRouter");
const commentRouter = require("./commentRouter");
const investmentRouter = require("./investmentRouter");
const teamRouter = require("./teamRourer");

router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/notifications", notificationRouter);
router.use("/groups", groupRouter);
router.use("/conferences", assignmentRouter);
router.use("/publications", publicationRouter);
router.use("/comments", commentRouter);
router.use("/investments", investmentRouter);
router.use("/teams", teamRouter);

module.exports = router;
