const router = require('express').Router();
const recursosController = require('../controllers/recursos.controller');
const recursosMovimientosController = require('../controllers/recursos-movimientos.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosController.list);
router.get('/movimientos', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosMovimientosController.list);
router.get('/movimientos/:recursoId', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosMovimientosController.listByRecursoId);
router.post('/movimientos', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosMovimientosController.create);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), recursosController.remove);

module.exports = router;
