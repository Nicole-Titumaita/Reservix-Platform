USE sistema_reservas_academico;

ALTER TABLE historial_reservas
  ADD INDEX idx_historial_usuario_fecha (usuario_id, fecha_accion);
