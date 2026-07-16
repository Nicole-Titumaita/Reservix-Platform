USE sistema_reservas_academico;

INSERT IGNORE INTO roles (id, nombre, descripcion) VALUES
  (1, 'ADMINISTRADOR', 'Acceso total al sistema'),
  (2, 'DOCENTE', 'Usuario docente con permisos de reserva'),
  (3, 'ESTUDIANTE', 'Usuario estudiante con permisos de reserva');

INSERT IGNORE INTO estados (id, categoria, nombre, descripcion, activo) VALUES
  (1, 'USUARIO', 'ACTIVO', 'Usuario habilitado', 1),
  (2, 'USUARIO', 'INACTIVO', 'Usuario deshabilitado', 1),
  (3, 'ESPACIO', 'DISPONIBLE', 'Espacio disponible', 1),
  (4, 'ESPACIO', 'MANTENIMIENTO', 'Espacio en mantenimiento', 1),
  (5, 'ESPACIO', 'OCUPADO', 'Espacio ocupado', 1),
  (6, 'RECURSO', 'DISPONIBLE', 'Recurso disponible', 1),
  (7, 'RECURSO', 'EN_USO', 'Recurso en uso', 1),
  (8, 'RECURSO', 'DANIADO', 'Recurso danado', 1),
  (9, 'RESERVA', 'PENDIENTE', 'Reserva pendiente de aprobacion', 1),
  (10, 'RESERVA', 'APROBADA', 'Reserva aprobada', 1),
  (11, 'RESERVA', 'RECHAZADA', 'Reserva rechazada', 1),
  (12, 'RESERVA', 'CANCELADA', 'Reserva cancelada', 1);

INSERT IGNORE INTO usuarios
  (id, rol_id, estado_id, nombre, apellido, cedula, cedula_provincia, email, password_hash, telefono, codigo_institucional)
VALUES
  (1, 1, 1, 'Admin', 'Sistema', '1710034065', 'Pichincha', 'admin@demo.local', '$2a$10$IKV8Mx4UX.rxntB5VOKNlOHL4a6RMGby8PgakEhriWBN.q9felkGm', '0999999999', 'ADM-0001'),
  (2, 2, 1, 'Docente', 'Prueba', '1726687856', 'Pichincha', 'docente@demo.local', '$2a$10$ukOaWrsew.1DMEg/0eWrhu8kPfq.BW3FQHntHGDj3XvSlwD8MZBpS', '0999999998', 'DOC-0001'),
  (3, 3, 1, 'Alumno', 'Prueba', '0926687856', 'Guayas', 'alumno@demo.local', '$2a$10$YcjnbmvoWfiJY9zLBHPudOb6KZwO3P0WXDjYUwbTSwX57oZ01qKNW', '0999999997', 'EST-0001');

INSERT IGNORE INTO horarios
  (id, nombre, dia_semana, hora_inicio, hora_fin, activo)
VALUES
  (1, 'Lunes 08-10', 'LUNES', '08:00:00', '10:00:00', 1),
  (2, 'Martes 10-12', 'MARTES', '10:00:00', '12:00:00', 1);

INSERT IGNORE INTO espacios
  (id, estado_id, codigo, nombre, tipo, ubicacion, capacidad, descripcion)
VALUES
  (1, 3, 'LAB-101', 'Laboratorio 101', 'LABORATORIO', 'Bloque A', 30, 'Laboratorio de computo para pruebas'),
  (2, 4, 'AULA-201', 'Aula 201', 'AULA', 'Bloque B', 25, 'Aula de apoyo para clases y reservas');

INSERT IGNORE INTO recursos
  (id, espacio_id, estado_id, codigo, nombre, tipo, marca, modelo, serial, descripcion)
VALUES
  (1, 1, 6, 'PROY-001', 'Proyector Epson', 'PROYECTOR', 'Epson', 'X123', 'SN-PROY-001', 'Recurso de prueba'),
  (2, 1, 7, 'LAPT-001', 'Laptop Dell', 'LAPTOP', 'Dell', 'Latitude', 'SN-LAPT-001', 'Equipo de prueba');

INSERT IGNORE INTO reservas
  (id, usuario_id, espacio_id, horario_id, estado_id, fecha_reserva, fecha_inicio, fecha_fin, motivo, observaciones)
VALUES
  (1, 3, 1, 1, 9, CURDATE(), CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 10:00:00'), 'Prueba inicial de reserva', 'Reserva semilla para validar el flujo');

INSERT IGNORE INTO reserva_recursos
  (id, reserva_id, recurso_id, cantidad)
VALUES
  (1, 1, 1, 1);

INSERT IGNORE INTO historial_reservas
  (id, reserva_id, usuario_id, estado_anterior_id, estado_nuevo_id, accion, observacion)
VALUES
  (1, 1, 1, NULL, 9, 'CREACION', 'Reserva semilla creada por el sistema');

INSERT IGNORE INTO historial_recursos
  (id, recurso_id, usuario_id, rol_id, rol_nombre, estado_anterior_id, estado_nuevo_id, accion, observacion)
VALUES
  (1, 1, 1, 1, 'ADMINISTRADOR', 6, 7, 'ASIGNACION', 'Recurso semilla asignado para pruebas de seguimiento');
