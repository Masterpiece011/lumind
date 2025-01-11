const Router = require("express");
const router = new Router();

const publicationController = require("../controllers/publicationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, publicationController.create);
router.get("/:id", authMiddleware, publicationController.getOne);
router.get("/", authMiddleware, publicationController.getAll);
router.delete("/", authMiddleware, publicationController.delete);

router.put("/", authMiddleware, publicationController.update);

module.exports = router;
