module.exports = {
  roles: require('./roles.model'),
  usuarios: require('./usuarios.model'),
  estados: require('./estados.model'),
  espacios: require('./espacios.model'),
  recursos: require('./recursos.model'),
  horarios: require('./horarios.model'),
  reservas: require('./reservas.model'),
  historial: require('./historial.model'),
  twoFactorCodes: require('./two-factor-codes.model'),
  loginAttempts: require('./login-attempts.model'),
  auditoria: require('./auditoria.model'),
  passwordResets: require('./password-resets.model'),
  institutionalCodes: require('./institutional-codes.model'),
  institutionalCodeSequences: require('./institutional-code-sequences.model')
};
