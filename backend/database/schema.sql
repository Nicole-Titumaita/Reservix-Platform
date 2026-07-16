CREATE DATABASE IF NOT EXISTS sistema_reservas_academico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE sistema_reservas_academico;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS estados (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria VARCHAR(20) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estados_categoria_nombre (categoria, nombre),
  KEY idx_estados_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  rol_id INT UNSIGNED NOT NULL,
  estado_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(10) NULL,
  cedula_provincia VARCHAR(80) NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) NULL,
  codigo_institucional VARCHAR(50) NULL,
  two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  UNIQUE KEY uq_usuarios_cedula (cedula),
  UNIQUE KEY uq_usuarios_codigo (codigo_institucional),
  KEY idx_usuarios_rol (rol_id),
  KEY idx_usuarios_estado (estado_id),
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_usuarios_estados
    FOREIGN KEY (estado_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS two_factor_codes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  purpose VARCHAR(30) NOT NULL DEFAULT 'LOGIN',
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_two_factor_usuario (usuario_id),
  KEY idx_two_factor_lookup (usuario_id, purpose, used_at, expires_at),
  CONSTRAINT fk_two_factor_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NULL,
  email VARCHAR(150) NOT NULL,
  endpoint VARCHAR(80) NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  failure_reason VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_login_attempts_usuario (usuario_id),
  KEY idx_login_attempts_email (email),
  KEY idx_login_attempts_created_at (created_at),
  KEY idx_login_attempts_email_fecha (email, created_at),
  KEY idx_login_attempts_ip_fecha (ip, created_at),
  CONSTRAINT fk_login_attempts_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS auditoria (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NULL,
  accion VARCHAR(80) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  entidad_id VARCHAR(80) NULL,
  detalle JSON NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_usuario (usuario_id),
  KEY idx_auditoria_entidad (entidad, entidad_id),
  KEY idx_auditoria_created_at (created_at),
  KEY idx_auditoria_usuario_fecha (usuario_id, created_at),
  KEY idx_auditoria_accion_fecha (accion, created_at),
  CONSTRAINT fk_auditoria_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_resets_usuario (usuario_id),
  KEY idx_password_resets_token_hash (token_hash),
  KEY idx_password_resets_lookup (usuario_id, used_at, expires_at),
  CONSTRAINT fk_password_resets_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS institutional_code_sequences (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sequence_key VARCHAR(30) NOT NULL,
  rol_id INT UNSIGNED NOT NULL,
  rol_nombre VARCHAR(50) NOT NULL,
  prefix VARCHAR(10) NOT NULL,
  year INT NOT NULL,
  next_sequence INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_institutional_code_sequences_key (sequence_key),
  KEY idx_institutional_code_sequences_prefix_year (prefix, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS institutional_codes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  rol_id INT UNSIGNED NOT NULL,
  rol_nombre VARCHAR(50) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  code_display VARCHAR(30) NOT NULL,
  purpose VARCHAR(30) NOT NULL DEFAULT 'REGISTRO',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_institutional_codes_email (email),
  KEY idx_institutional_codes_rol (rol_id),
  KEY idx_institutional_codes_expiry (expires_at),
  KEY idx_institutional_codes_lookup (email, rol_id, purpose, used_at, expires_at),
  CONSTRAINT fk_institutional_codes_roles
    FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS horarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_horarios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS espacios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  estado_id INT UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  ubicacion VARCHAR(150) NULL,
  capacidad INT UNSIGNED NOT NULL DEFAULT 0,
  descripcion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_espacios_codigo (codigo),
  KEY idx_espacios_estado (estado_id),
  CONSTRAINT fk_espacios_estados
    FOREIGN KEY (estado_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS recursos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  espacio_id INT UNSIGNED NULL,
  estado_id INT UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  marca VARCHAR(80) NULL,
  modelo VARCHAR(80) NULL,
  serial VARCHAR(100) NULL,
  descripcion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recursos_codigo (codigo),
  UNIQUE KEY uq_recursos_serial (serial),
  KEY idx_recursos_espacio (espacio_id),
  KEY idx_recursos_estado (estado_id),
  CONSTRAINT fk_recursos_espacios
    FOREIGN KEY (espacio_id) REFERENCES espacios (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_recursos_estados
    FOREIGN KEY (estado_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS reservas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  espacio_id INT UNSIGNED NOT NULL,
  horario_id INT UNSIGNED NOT NULL,
  estado_id INT UNSIGNED NOT NULL,
  fecha_reserva DATE NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  observaciones TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reservas_usuario (usuario_id),
  KEY idx_reservas_espacio (espacio_id),
  KEY idx_reservas_horario (horario_id),
  KEY idx_reservas_estado (estado_id),
  KEY idx_reservas_disponibilidad (espacio_id, estado_id, fecha_inicio, fecha_fin),
  KEY idx_reservas_usuario_fecha (usuario_id, fecha_inicio),
  CONSTRAINT fk_reservas_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_espacios
    FOREIGN KEY (espacio_id) REFERENCES espacios (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_horarios
    FOREIGN KEY (horario_id) REFERENCES horarios (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_estados
    FOREIGN KEY (estado_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS reserva_recursos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reserva_id INT UNSIGNED NOT NULL,
  recurso_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reserva_recurso (reserva_id, recurso_id),
  KEY idx_reserva_recursos_reserva (reserva_id),
  KEY idx_reserva_recursos_recurso (recurso_id),
  CONSTRAINT fk_reserva_recursos_reservas
    FOREIGN KEY (reserva_id) REFERENCES reservas (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_reserva_recursos_recursos
    FOREIGN KEY (recurso_id) REFERENCES recursos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS historial_reservas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reserva_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  estado_anterior_id INT UNSIGNED NULL,
  estado_nuevo_id INT UNSIGNED NOT NULL,
  accion VARCHAR(50) NOT NULL,
  observacion TEXT NULL,
  fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historial_reserva (reserva_id),
  KEY idx_historial_usuario (usuario_id),
  CONSTRAINT fk_historial_reservas
    FOREIGN KEY (reserva_id) REFERENCES reservas (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_historial_estado_anterior
    FOREIGN KEY (estado_anterior_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_historial_estado_nuevo
    FOREIGN KEY (estado_nuevo_id) REFERENCES estados (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
