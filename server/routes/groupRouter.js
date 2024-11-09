const Router = require('express')
const router = new Router()

const groupController = require('../controllers/groupController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/', authMiddleware, roleMiddleware(), groupController.create)
router.get('/:id', groupController.getOne )
router.get('/', groupController.getAll)
router.delete('/', authMiddleware, roleMiddleware(), groupController.delete)

router.put('/', authMiddleware, roleMiddleware(), groupController.update)

module.exports = router