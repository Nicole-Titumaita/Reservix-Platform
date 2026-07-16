USE sistema_reservas_academico;

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
  UNIQUE KEY uq_institutional_codes_display (code_display),
  KEY idx_institutional_codes_email (email),
  KEY idx_institutional_codes_rol (rol_id),
  KEY idx_institutional_codes_expiry (expires_at),
  KEY idx_institutional_codes_lookup (email, rol_id, purpose, used_at, expires_at),
  CONSTRAINT fk_institutional_codes_roles
    FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
