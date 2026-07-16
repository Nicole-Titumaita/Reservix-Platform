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
  (1, 1, 1, 'Admin', 'Sistema', '1710034065', 'Pichincha', 'admin@demo.local', '$2a$10$IKV8Mx4UX.rxntB5VOKNlOHL4a6RMGby8PgakEhriWBN.q9felkGm', '0999999999', 'ADM-2026-000001'),
  (2, 2, 1, 'Docente', 'Prueba', '1726687856', 'Pichincha', 'docente@demo.local', '$2a$10$ukOaWrsew.1DMEg/0eWrhu8kPfq.BW3FQHntHGDj3XvSlwD8MZBpS', '0999999998', 'DOC-2026-000001'),
  (3, 3, 1, 'Alumno', 'Prueba', '0926687856', 'Guayas', 'alumno@demo.local', '$2a$10$YcjnbmvoWfiJY9zLBHPudOb6KZwO3P0WXDjYUwbTSwX57oZ01qKNW', '0999999997', 'EST-2026-000001');

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

INSERT IGNORE INTO reservas
  (id, usuario_id, espacio_id, horario_id, estado_id, fecha_reserva, fecha_inicio, fecha_fin, motivo, observaciones)
VALUES
  (20, 2, 1, 1, 9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:00:00'), 'Clase de programacion', 'Solicitud docente para laboratorio de computo'),
  (21, 2, 1, 2, 10, DATE_ADD(CURDATE(), INTERVAL 2 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 10:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 12:00:00'), 'Capacitacion en software', 'Reserva aprobada de ejemplo'),
  (22, 2, 2, 1, 11, DATE_ADD(CURDATE(), INTERVAL 3 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 10:00:00'), 'Tutorias academicas', 'Reserva rechazada de ejemplo'),
  (23, 2, 2, 2, 12, DATE_ADD(CURDATE(), INTERVAL 4 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 10:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 12:00:00'), 'Clase cancelada', 'Reserva cancelada por el docente'),
  (24, 2, 1, 1, 9, DATE_ADD(CURDATE(), INTERVAL 5 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 10:00:00'), 'Laboratorio de bases de datos', 'Ejemplo pendiente para docente'),
  (25, 2, 1, 2, 10, DATE_ADD(CURDATE(), INTERVAL 6 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 10:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 12:00:00'), 'Examen practico', 'Reserva aprobada para pruebas'),
  (26, 2, 2, 1, 9, DATE_ADD(CURDATE(), INTERVAL 7 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 10:00:00'), 'Demostracion de clase', 'Pendiente de revision'),
  (27, 2, 2, 2, 10, DATE_ADD(CURDATE(), INTERVAL 8 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 8 DAY), ' 10:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 8 DAY), ' 12:00:00'), 'Entrega de proyecto', 'Aprobada para sala de apoyo'),
  (28, 2, 1, 1, 11, DATE_ADD(CURDATE(), INTERVAL 9 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 9 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 9 DAY), ' 10:00:00'), 'Sustentacion anulada', 'Rechazada por cruce de horario'),
  (29, 2, 2, 2, 9, DATE_ADD(CURDATE(), INTERVAL 10 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 10 DAY), ' 10:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 10 DAY), ' 12:00:00'), 'Clase de apoyo docente', 'Pendiente para seguimiento');

INSERT IGNORE INTO reserva_recursos
  (id, reserva_id, recurso_id, cantidad)
VALUES
  (1, 1, 1, 1),
  (20, 21, 1, 1),
  (21, 25, 2, 1),
  (22, 27, 1, 1);

INSERT IGNORE INTO historial_reservas
  (id, reserva_id, usuario_id, estado_anterior_id, estado_nuevo_id, accion, observacion)
VALUES
  (1, 1, 1, NULL, 9, 'CREACION', 'Reserva semilla creada por el sistema'),
  (20, 20, 2, NULL, 9, 'CREACION', 'Reserva semilla de docente para pruebas'),
  (21, 21, 2, NULL, 10, 'CREACION', 'Reserva semilla de docente aprobada'),
  (22, 22, 2, NULL, 11, 'CREACION', 'Reserva semilla de docente rechazada'),
  (23, 23, 2, NULL, 12, 'CREACION', 'Reserva semilla de docente cancelada'),
  (24, 24, 2, NULL, 9, 'CREACION', 'Reserva pendiente de ejemplo'),
  (25, 25, 2, NULL, 10, 'CREACION', 'Reserva aprobada para laboratorio'),
  (26, 26, 2, NULL, 9, 'CREACION', 'Reserva pendiente de seguimiento'),
  (27, 27, 2, NULL, 10, 'CREACION', 'Reserva aprobada para apoyo académico'),
  (28, 28, 2, NULL, 11, 'CREACION', 'Reserva rechazada por conflicto'),
  (29, 29, 2, NULL, 9, 'CREACION', 'Reserva pendiente para clase de apoyo');

INSERT IGNORE INTO historial_recursos
  (id, recurso_id, usuario_id, rol_id, rol_nombre, estado_anterior_id, estado_nuevo_id, accion, observacion)
VALUES
  (1, 1, 1, 1, 'ADMINISTRADOR', 6, 7, 'ASIGNACION', 'Recurso semilla asignado para pruebas de seguimiento');
