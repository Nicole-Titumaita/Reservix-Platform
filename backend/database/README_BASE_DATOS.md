# Base de datos

Base actual: `sistema_reservas_academico`

## Tablas actuales

- `roles`
- `estados`
- `usuarios`
- `horarios`
- `espacios`
- `recursos`
- `reservas`
- `reserva_recursos`
- `historial_reservas`
- `historial_recursos`

## Lo que ya cubre

- Usuarios con roles: administrador, docente y estudiante.
- Estados por categoria: usuario, espacio, recurso y reserva.
- Espacios reservables.
- Recursos tecnologicos asociados opcionalmente a espacios.
- Horarios base.
- Reservas con usuario, espacio, horario, estado, fechas, motivo y observaciones.
- Recursos asociados a una reserva mediante `reserva_recursos`.
- Seguimiento de recursos mediante `historial_recursos` para registrar asignaciones, entregas, devoluciones y cambios de estado.
- Historial de movimientos de reserva mediante `historial_reservas`.

## Lo que falta para una version mas completa

- Tabla de perfiles academicos para diferenciar datos propios de alumno y docente.
- Tabla de programas, facultades, cursos o grupos academicos.
- Campo o tabla para tipo de solicitud si se necesitan solicitudes academicas diferentes a reserva.
- Tabla de disponibilidad real por espacio y fecha, si no se quiere depender solo de reservas.
- Tabla de mantenimiento de espacios y recursos.
- Tabla de notificaciones para informar aprobaciones, rechazos o cancelaciones.
- Tabla de archivos o soportes si una reserva requiere adjuntos.
- Auditoria general para cambios en usuarios, roles, espacios, recursos y horarios.
- Soft delete con campo `eliminado_en` para evitar borrar registros historicos.
- Indices adicionales por fechas de reserva: `fecha_inicio`, `fecha_fin`.
- Restricciones para validar que `fecha_inicio` sea menor que `fecha_fin`.

## Prioridad recomendada

1. Agregar indices por fechas en `reservas`.
2. Agregar seguimiento de recursos y mantenimiento de espacios si el flujo academico lo requiere.
3. Agregar notificaciones.
4. Agregar auditoria general.
5. Agregar perfiles academicos si el proyecto necesita datos mas especificos de alumnos y docentes.
