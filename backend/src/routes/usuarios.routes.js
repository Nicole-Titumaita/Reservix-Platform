const router = require('express').Router();
const usuariosController = require('../controllers/usuarios.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), usuariosController.list);
router.get('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), usuariosController.getById);
router.post('/', authMiddleware, roleMiddleware('ADMINISTRADOR'), usuariosController.create);
router.put('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), usuariosController.update);
router.delete('/:id', authMiddleware, roleMiddleware('ADMINISTRADOR'), usuariosController.remove);

module.exports = router;
