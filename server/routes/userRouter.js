const Router = require('express')
const router = new Router()

const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/registration', authMiddleware, roleMiddleware(), userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.get('/', userController.getAll)
router.get('/:id', userController.getOne)
router.delete('/', authMiddleware, roleMiddleware(), userController.delete)

router.put('/', authMiddleware, roleMiddleware(), userController.update)


module.exports = router
