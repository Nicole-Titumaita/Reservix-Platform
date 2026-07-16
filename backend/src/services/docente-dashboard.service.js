const docenteDashboard = require('../models/docente-dashboard.model');

async function getDashboard(userId) {
  if (!userId) {
    const error = new Error('Token no proporcionado');
    error.status = 401;
    throw error;
  }

  const [summary, upcomingReservations, recentActivity] = await Promise.all([
    docenteDashboard.getSummary(userId),
    docenteDashboard.getUpcomingReservations(userId),
    docenteDashboard.getRecentActivity(userId)
  ]);

  return {
    resumen: {
      total_reservas: Number(summary.total_reservas || 0),
      pendientes: Number(summary.pendientes || 0),
      aprobadas: Number(summary.aprobadas || 0),
      rechazadas: Number(summary.rechazadas || 0),
      canceladas: Number(summary.canceladas || 0),
      proximas: Number(summary.proximas || 0)
    },
    proximas_reservas: upcomingReservations,
    historial_reciente: recentActivity
  };
}

module.exports = {
  getDashboard
};
