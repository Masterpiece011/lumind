const Router = require("express");
const router = new Router();

const teamConferenceController = require("../controllers/teamConferenceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, teamConferenceController.create);
router.get("/:id", authMiddleware, teamConferenceController.getOne);
router.get(
    "/",
    authMiddleware,
    roleMiddleware(),
    teamConferenceController.getAll
);

router.put("/", authMiddleware, teamConferenceController.update);

module.exports = router;
