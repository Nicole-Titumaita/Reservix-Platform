const router = require('express').Router();
const historialController = require('../controllers/historial.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), historialController.list);
router.get('/mi-historial', authMiddleware, roleMiddleware('DOCENTE', 'ESTUDIANTE'), historialController.listMine);
router.get('/reserva/:reservaId', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), historialController.listByReservaId);

module.exports = router;
