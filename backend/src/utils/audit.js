const { auditoria } = require('../models');

async function recordAudit(data) {
  try {
    await auditoria.create(data);
  } catch (error) {
    console.error('No fue posible registrar auditoria:', { message: error.message });
  }
}

function buildRequestMeta(req) {
  return {
    actor_id: req.user?.id,
    actor_role_id: req.user?.rol_id,
    actor_role_name: req.user?.rol,
    ip: req.ip,
    user_agent: req.get('user-agent')
  };
}

module.exports = {
  recordAudit,
  buildRequestMeta
};
