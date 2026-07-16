ALTER TABLE historial_recursos
  ADD COLUMN rol_id INT UNSIGNED NOT NULL AFTER usuario_id,
  ADD COLUMN rol_nombre VARCHAR(50) NOT NULL AFTER rol_id;

ALTER TABLE historial_recursos
  ADD CONSTRAINT fk_historial_recursos_roles
    FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
