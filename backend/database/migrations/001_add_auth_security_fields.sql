USE sistema_reservas_academico;

ALTER TABLE usuarios
  ADD COLUMN cedula VARCHAR(10) NULL AFTER apellido,
  ADD COLUMN cedula_provincia VARCHAR(80) NULL AFTER cedula,
  ADD COLUMN two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER codigo_institucional,
  ADD COLUMN two_factor_temp_code VARCHAR(10) NULL AFTER two_factor_enabled,
  ADD COLUMN two_factor_expires_at DATETIME NULL AFTER two_factor_temp_code;

ALTER TABLE usuarios
  ADD UNIQUE KEY uq_usuarios_cedula (cedula);
