const Router = require("express");
const router = new Router();

const conferenceController = require("../controllers/conferenceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, conferenceController.create);
router.get("/:id", authMiddleware, conferenceController.getOne);
router.get("/", roleMiddleware(), authMiddleware, conferenceController.getAll);

router.put("/", authMiddleware, conferenceController.update);

module.exports = router;
