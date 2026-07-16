CREATE DATABASE IF NOT EXISTS sistema_reservas_academico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_reservas_academico;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(150),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE estados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria ENUM('USUARIO','ESPACIO','RECURSO','RESERVA') NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(150),
  activo TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol_id INT NOT NULL,
  estado_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(10) UNIQUE,
  cedula_provincia VARCHAR(80),
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  codigo_institucional VARCHAR(30) UNIQUE,
  two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
  two_factor_temp_code VARCHAR(10),
  two_factor_expires_at DATETIME,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles(id),
  CONSTRAINT fk_usuarios_estados FOREIGN KEY (estado_id) REFERENCES estados(id)
) ENGINE=InnoDB;

CREATE TABLE espacios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estado_id INT NOT NULL,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  ubicacion VARCHAR(150),
  capacidad INT DEFAULT 0,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_espacios_estados FOREIGN KEY (estado_id) REFERENCES estados(id)
) ENGINE=InnoDB;

CREATE TABLE recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  espacio_id INT NULL,
  estado_id INT NOT NULL,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  serial VARCHAR(80),
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recursos_espacios FOREIGN KEY (espacio_id) REFERENCES espacios(id),
  CONSTRAINT fk_recursos_estados FOREIGN KEY (estado_id) REFERENCES estados(id)
) ENGINE=InnoDB;

CREATE TABLE horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  dia_semana ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  espacio_id INT NOT NULL,
  horario_id INT NOT NULL,
  estado_id INT NOT NULL,
  fecha_reserva DATE NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  motivo VARCHAR(200) NOT NULL,
  observaciones TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservas_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_reservas_espacios FOREIGN KEY (espacio_id) REFERENCES espacios(id),
  CONSTRAINT fk_reservas_horarios FOREIGN KEY (horario_id) REFERENCES horarios(id),
  CONSTRAINT fk_reservas_estados FOREIGN KEY (estado_id) REFERENCES estados(id)
) ENGINE=InnoDB;

CREATE TABLE reserva_recursos (
  reserva_id INT NOT NULL,
  recurso_id INT NOT NULL,
  cantidad INT DEFAULT 1,
  PRIMARY KEY (reserva_id, recurso_id),
  CONSTRAINT fk_reserva_recursos_reservas FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  CONSTRAINT fk_reserva_recursos_recursos FOREIGN KEY (recurso_id) REFERENCES recursos(id)
) ENGINE=InnoDB;

CREATE TABLE historial_reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  usuario_id INT NOT NULL,
  estado_anterior_id INT NULL,
  estado_nuevo_id INT NOT NULL,
  accion VARCHAR(100) NOT NULL,
  observacion TEXT,
  fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_reservas FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_historial_estado_anterior FOREIGN KEY (estado_anterior_id) REFERENCES estados(id),
  CONSTRAINT fk_historial_estado_nuevo FOREIGN KEY (estado_nuevo_id) REFERENCES estados(id)
) ENGINE=InnoDB;
