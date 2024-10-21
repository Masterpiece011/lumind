const Router = require('express')
const router = new Router()

const groupController = require('../controllers/groupController')

router.post('/', groupController.create)
router.get('/:id',groupController.getOne )
router.get('/', groupController.getAll)
router.delete('/', groupController.delete)

router.put('/', groupController.update)

module.exports = router