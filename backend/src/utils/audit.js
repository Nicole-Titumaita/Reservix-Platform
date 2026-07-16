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
    ip: req.ip,
    user_agent: req.get('user-agent')
  };
}

module.exports = {
  recordAudit,
  buildRequestMeta
};
