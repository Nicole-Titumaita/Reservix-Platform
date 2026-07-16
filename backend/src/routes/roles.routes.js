const router = require('express').Router();
const rolesController = require('../controllers/roles.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), rolesController.list);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), rolesController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), rolesController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), rolesController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), rolesController.remove);

module.exports = router;
