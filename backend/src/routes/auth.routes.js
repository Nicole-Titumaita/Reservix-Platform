const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { loginLimiter, authBurstLimiter, passwordRecoveryLimiter } = require('../middlewares/rate-limit.middleware');

router.post('/register', authBurstLimiter, loginLimiter, authController.register);
router.post('/login', authBurstLimiter, loginLimiter, authController.login);
router.post('/admin-login', authBurstLimiter, loginLimiter, authController.adminLogin);
router.post('/verify-2fa', authBurstLimiter, loginLimiter, authController.verifyTwoFactor);
router.post('/resend-2fa', authBurstLimiter, loginLimiter, authController.resendTwoFactor);
router.post('/forgot-password', authBurstLimiter, passwordRecoveryLimiter, authController.forgotPassword);
router.get('/reset-password/:token', authBurstLimiter, passwordRecoveryLimiter, authController.validateResetPasswordToken);
router.post('/reset-password', authBurstLimiter, passwordRecoveryLimiter, authController.resetPassword);
router.post('/request-institutional-code', authBurstLimiter, loginLimiter, authController.requestInstitutionalCode);
router.post('/verify-institutional-code', authBurstLimiter, loginLimiter, authController.verifyInstitutionalCode);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
