const Router = require("express");
const router = new Router();

const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware(), teamController.create);
router.get("/:id", teamController.getOne);
router.get("/", teamController.getAll);
router.delete("/", authMiddleware, roleMiddleware(), teamController.delete);

router.put("/", authMiddleware, roleMiddleware(), teamController.update);

module.exports = router;
