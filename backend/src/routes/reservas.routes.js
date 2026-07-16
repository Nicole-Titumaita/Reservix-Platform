const router = require('express').Router();
const reservasController = require('../controllers/reservas.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/mis-reservas', authMiddleware, roleMiddleware('DOCENTE', 'ESTUDIANTE'), reservasController.listMine);
router.get('/disponibilidad', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), reservasController.disponibilidad);
router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), reservasController.list);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), reservasController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), reservasController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), reservasController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), reservasController.remove);
router.patch('/:id/aprobar', authMiddleware, roleMiddleware('ADMINISTRADOR'), reservasController.aprobar);
router.patch('/:id/rechazar', authMiddleware, roleMiddleware('ADMINISTRADOR'), reservasController.rechazar);
router.patch('/:id/cancelar', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), reservasController.cancelar);

module.exports = router;
