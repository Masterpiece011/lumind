const Router = require("express");
const router = new Router();

const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware(), assignmentController.create);
router.get("/:id", authMiddleware, assignmentController.getOne);
router.get("/", authMiddleware, assignmentController.getAll);
router.delete("/", authMiddleware, roleMiddleware(), assignmentController.delete);

router.put("/", authMiddleware, roleMiddleware(), assignmentController.update);

module.exports = router;
