USE sistema_reservas_academico;

INSERT INTO roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Gestiona usuarios, espacios, recursos y reservas'),
('DOCENTE', 'Solicita reservas de recursos y espacios'),
('ESTUDIANTE', 'Consulta y solicita reservas segun permisos');

INSERT INTO estados (categoria, nombre, descripcion) VALUES
('USUARIO', 'ACTIVO', 'Usuario habilitado'),
('USUARIO', 'INACTIVO', 'Usuario deshabilitado'),
('ESPACIO', 'DISPONIBLE', 'Espacio disponible'),
('ESPACIO', 'MANTENIMIENTO', 'Espacio en mantenimiento'),
('RECURSO', 'DISPONIBLE', 'Recurso disponible'),
('RECURSO', 'PRESTADO', 'Recurso prestado'),
('RECURSO', 'MANTENIMIENTO', 'Recurso en mantenimiento'),
('RESERVA', 'PENDIENTE', 'Reserva pendiente'),
('RESERVA', 'APROBADA', 'Reserva aprobada'),
('RESERVA', 'RECHAZADA', 'Reserva rechazada'),
('RESERVA', 'CANCELADA', 'Reserva cancelada');

