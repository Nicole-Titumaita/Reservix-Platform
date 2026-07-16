CREATE TABLE IF NOT EXISTS historial_recursos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  recurso_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  estado_anterior_id INT UNSIGNED NULL,
  estado_nuevo_id INT UNSIGNED NOT NULL,
  accion VARCHAR(50) NOT NULL,
  observacion TEXT NULL,
  fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historial_recursos_recurso (recurso_id),
  KEY idx_historial_recursos_usuario (usuario_id),
  KEY idx_historial_recursos_fecha (fecha_accion),
  CONSTRAINT fk_historial_recursos
    FOREIGN KEY (recurso_id) REFERENCES recursos (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_historial_recursos_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_historial_recursos_estado_anterior
    FOREIGN KEY (estado_anterior_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_historial_recursos_estado_nuevo
    FOREIGN KEY (estado_nuevo_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
