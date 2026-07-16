const authService = require('../services/auth.service');
const passwordResetService = require('../services/password-reset.service');
const institutionalCodeService = require('../services/institutional-code.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const usuario = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'Usuario registrado correctamente',
    data: usuario
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, {
    endpoint: 'login',
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  res.json({
    success: true,
    message: 'Credenciales correctas. Codigo 2FA enviado',
    data: result
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const result = await authService.adminLogin(req.body, {
    endpoint: 'admin-login',
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  res.json({
    success: true,
    message: 'Credenciales administrativas correctas. Codigo 2FA enviado',
    data: result
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Sesion cerrada correctamente'
  });
});

const verifyTwoFactor = asyncHandler(async (req, res) => {
  const result = await authService.verifyTwoFactor(req.body, {
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  res.json({
    success: true,
    message: 'Verificacion 2FA correcta',
    data: result
  });
});

const resendTwoFactor = asyncHandler(async (req, res) => {
  const result = await authService.resendTwoFactor(req.body);
  res.json({
    success: true,
    message: 'Codigo 2FA reenviado correctamente',
    data: result
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await passwordResetService.requestPasswordReset(req.body?.email, {
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  res.json({
    success: true,
    message: 'Si el correo pertenece a una cuenta registrada, recibirás un enlace para restablecer tu contraseña.'
  });
});

const validateResetPasswordToken = asyncHandler(async (req, res) => {
  const result = await passwordResetService.validateResetToken(req.params.token);
  res.json({
    success: true,
    message: result.valid ? 'El enlace es valido' : 'El enlace no es valido o ha expirado',
    data: result
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await passwordResetService.resetPassword(req.body, {
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  res.json({
    success: true,
    message: 'Contrasena actualizada correctamente'
  });
});

const requestInstitutionalCode = asyncHandler(async (req, res) => {
  const result = await institutionalCodeService.requestInstitutionalCode(req.body);
  res.json(result);
});

const verifyInstitutionalCode = asyncHandler(async (req, res) => {
  const result = await institutionalCodeService.verifyInstitutionalCode(req.body);
  res.json(result);
});

module.exports = {
  register,
  login,
  adminLogin,
  me,
  logout,
  verifyTwoFactor,
  resendTwoFactor,
  forgotPassword,
  validateResetPasswordToken,
  resetPassword,
  requestInstitutionalCode,
  verifyInstitutionalCode
};
