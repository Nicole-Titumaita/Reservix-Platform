const docenteDashboardService = require('../services/docente-dashboard.service');

async function dashboard(req, res, next) {
  try {
    const data = await docenteDashboardService.getDashboard(req.user?.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboard
};
