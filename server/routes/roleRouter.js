const Router = require('express')
const router = new Router()

const roleController = require('../controllers/roleController')

router.post('/', roleController.create)
// router.post('delete', roleController.delete)
router.get('/', roleController.getAll)


module.exports = router