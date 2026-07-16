const router = require('express').Router();
const espaciosController = require('../controllers/espacios.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), espaciosController.list);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'), espaciosController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), espaciosController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), espaciosController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), espaciosController.remove);

module.exports = router;
