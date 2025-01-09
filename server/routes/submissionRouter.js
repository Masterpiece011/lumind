const Router = require("express");
const router = new Router();

const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware(), submissionController.create);
router.get("/:id", authMiddleware, submissionController.getOne);
router.get("/", authMiddleware, submissionController.getAll);
router.delete(
    "/",
    authMiddleware,
    roleMiddleware(),
    submissionController.delete
);

router.put("/", authMiddleware, roleMiddleware(), submissionController.update);

module.exports = router;
