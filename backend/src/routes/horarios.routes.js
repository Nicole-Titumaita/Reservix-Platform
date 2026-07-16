const router = require('express').Router();
const horariosController = require('../controllers/horarios.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), horariosController.list);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), horariosController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), horariosController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), horariosController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), horariosController.remove);

module.exports = router;
