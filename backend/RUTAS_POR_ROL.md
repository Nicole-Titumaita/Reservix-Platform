# Inventario de rutas por rol

Este archivo consolida las rutas activas del sistema para evitar mezclar experiencias entre administrador, docente y estudiante.

## Publicas

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin-login`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/resend-2fa`
- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password/:token`
- `POST /api/auth/reset-password`
- `POST /api/auth/request-institutional-code`
- `POST /api/auth/verify-institutional-code`

## Protegidas con login

- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/reservas/disponibilidad`

## Solo administrador

- `GET /api/roles`
- `GET /api/roles/:id`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`
- `GET /api/espacios`
- `GET /api/espacios/:id`
- `POST /api/espacios`
- `PUT /api/espacios/:id`
- `DELETE /api/espacios/:id`
- `GET /api/recursos`
- `GET /api/recursos/:id`
- `POST /api/recursos`
- `PUT /api/recursos/:id`
- `DELETE /api/recursos/:id`
- `GET /api/recursos/movimientos`
- `GET /api/recursos/movimientos/:recursoId`
- `POST /api/recursos/movimientos`
- `GET /api/horarios`
- `GET /api/horarios/:id`
- `POST /api/horarios`
- `PUT /api/horarios/:id`
- `DELETE /api/horarios/:id`
- `GET /api/estados`
- `GET /api/estados/:id`
- `POST /api/estados`
- `PUT /api/estados/:id`
- `DELETE /api/estados/:id`
- `GET /api/reservas`
- `GET /api/reservas/:id`
- `POST /api/reservas`
- `PUT /api/reservas/:id`
- `DELETE /api/reservas/:id`
- `PATCH /api/reservas/:id/aprobar`
- `PATCH /api/reservas/:id/rechazar`
- `PATCH /api/reservas/:id/cancelar`
- `GET /api/historial`

## Solo docente

- `GET /api/docente/dashboard`
- `GET /api/docente/reservas`
- `GET /api/docente/historial`
- `GET /api/docente/disponibilidad`

## Solo estudiante

- `GET /estudiante/dashboard`
- `GET /estudiante/reservas`
- `GET /estudiante/reservas/nueva`
- `GET /estudiante/reservas/editar/:id`
- `GET /estudiante/historial`
- `GET /estudiante/disponibilidad`

## Rutas legacy de compatibilidad

- `GET /mis-reservas`
- `GET /mis-reservas/nueva`
- `GET /mis-reservas/editar/:id`
- `GET /mi-historial`

Estas rutas antiguas redirigen al modulo de estudiante para no romper enlaces previos, pero ya no son la referencia principal.
