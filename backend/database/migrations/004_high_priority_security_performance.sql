USE sistema_reservas_academico;

DROP PROCEDURE IF EXISTS drop_column_if_exists;
DELIMITER $$
CREATE PROCEDURE drop_column_if_exists(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64)
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` DROP COLUMN `', p_column_name, '`');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL drop_column_if_exists('usuarios', 'two_factor_temp_code');
CALL drop_column_if_exists('usuarios', 'two_factor_expires_at');

DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE add_index_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_index_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD INDEX `', p_index_name, '` ', p_index_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL add_index_if_missing('reservas', 'idx_reservas_disponibilidad', '(espacio_id, estado_id, fecha_inicio, fecha_fin)');
CALL add_index_if_missing('reservas', 'idx_reservas_usuario_fecha', '(usuario_id, fecha_inicio)');
CALL add_index_if_missing('login_attempts', 'idx_login_attempts_email_fecha', '(email, created_at)');
CALL add_index_if_missing('login_attempts', 'idx_login_attempts_ip_fecha', '(ip, created_at)');
CALL add_index_if_missing('auditoria', 'idx_auditoria_usuario_fecha', '(usuario_id, created_at)');
CALL add_index_if_missing('auditoria', 'idx_auditoria_accion_fecha', '(accion, created_at)');

DROP PROCEDURE IF EXISTS drop_column_if_exists;
DROP PROCEDURE IF EXISTS add_index_if_missing;
