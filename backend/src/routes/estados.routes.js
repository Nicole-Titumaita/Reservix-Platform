const router = require('express').Router();
const estadosController = require('../controllers/estados.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), estadosController.list);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), estadosController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), estadosController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), estadosController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), estadosController.remove);

module.exports = router;
