const Router = require("express");
const router = new Router();

const userRouter = require("./userRouter");
const roleRouter = require("./roleRouter");
const groupRouter = require("./groupRouter");
const notificationRouter = require("./notificationRouter");
const assignmentRouter = require("./assignmentRouter");
const submissionRouter = require("./submissionRouter");
const publicationRouter = require("./publicationRouter");
const conferenceRouter = require("./conferenceRouter");
const teamConferenceRouter = require("./teamConferenceRouter");
const commentRouter = require("./commentRouter");
const investmentRouter = require("./investmentRouter");
const teamRouter = require("./teamRourer");

router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/notifications", notificationRouter);
router.use("/groups", groupRouter);
router.use("/conferences", conferenceRouter);
router.use("/teamconferences", teamConferenceRouter);
router.use("/assignments", assignmentRouter);
router.use("/submissions", submissionRouter);
router.use("/publications", publicationRouter);
router.use("/comments", commentRouter);
router.use("/investments", investmentRouter);
router.use("/teams", teamRouter);

module.exports = router;
