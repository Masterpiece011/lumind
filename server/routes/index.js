import { Router } from "express";

const router = Router();

import userRouter from "./userRouter.js";
import roleRouter from "./roleRouter.js";
import groupRouter from "./groupRouter.js";
import notificationRouter from "./notificationRouter.js";
import assignmentRouter from "./assignmentRouter.js";
import submissionRouter from "./submissionRouter.js";
import publicationRouter from "./publicationRouter.js";
import conferenceRouter from "./conferenceRouter.js";
import teamConferenceRouter from "./teamConferenceRouter.js";
import commentRouter from "./commentRouter.js";
import fileRouter from "./fileRouter.js";
import teamRouter from "./teamRouter.js";
import usersTeamsRouter from "./usersTeamsRouter.js";
import teamsTasksRouter from "./teamsTasksRouter.js";
import taskRouter from "./taskRouter.js";
import chatRouter from "./chatRouter.js";

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
router.use("/teams", teamRouter);
router.use("/users-teams", usersTeamsRouter);
router.use("/teams-tasks", teamsTasksRouter);
router.use("/tasks", taskRouter);
router.use("/files", fileRouter);
router.use("/chats", chatRouter);

export default router;
