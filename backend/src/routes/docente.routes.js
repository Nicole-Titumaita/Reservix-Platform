const router = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const docenteDashboardController = require('../controllers/docente-dashboard.controller');
const docenteReservasController = require('../controllers/docente-reservas.controller');
const docenteHistorialController = require('../controllers/docente-historial.controller');
const docenteDisponibilidadController = require('../controllers/docente-disponibilidad.controller');

router.get('/dashboard', authMiddleware, roleMiddleware('DOCENTE'), docenteDashboardController.dashboard);
router.get('/reservas', authMiddleware, roleMiddleware('DOCENTE'), docenteReservasController.list);
router.get('/historial', authMiddleware, roleMiddleware('DOCENTE'), docenteHistorialController.list);
router.get('/disponibilidad', authMiddleware, roleMiddleware('DOCENTE'), docenteDisponibilidadController.check);

module.exports = router;
