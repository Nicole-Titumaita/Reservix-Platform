USE sistema_reservas_academico;

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
