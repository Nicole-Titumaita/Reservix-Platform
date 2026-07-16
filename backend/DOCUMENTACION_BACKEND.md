# Documentacion del Backend

Proyecto: `Sistema Academico de Reservas de Espacios y Recursos Tecnologicos`

Este documento resume lo construido en el backend con Node.js, Express.js y MySQL, y deja alineado que necesita el backend para soportar correctamente el frontend CRUD.

## 1. Objetivo del backend

El backend es la capa servidor de la arquitectura multicapa. Sus responsabilidades son:

- Exponer endpoints REST para el frontend Angular.
- Conectarse a MySQL.
- Gestionar autenticacion con JWT.
- Controlar acceso por roles.
- Validar datos recibidos desde el frontend.
- Centralizar reglas de negocio.
- Mantener separadas rutas, controladores, servicios y modelos.

## 2. Tecnologias usadas

- Node.js
- Express.js
- MySQL
- JWT
- bcrypt
- dotenv
- cors
- nodemon para desarrollo

## 3. Estructura general

Carpetas principales:

- `backend/src/config`
- `backend/src/controllers`
- `backend/src/routes`
- `backend/src/services`
- `backend/src/models`
- `backend/src/middlewares`
- `backend/src/validators`
- `backend/src/utils`
- `backend/database`

## 4. Archivos principales

Configuracion:

- `backend/.env`
- `backend/src/config/env.js`
- `backend/src/config/db.js`

Arranque:

- `backend/src/app.js`
- `backend/src/server.js`
- `backend/SEGURIDAD.md`

Middlewares:

- `backend/src/middlewares/auth.middleware.js`
- `backend/src/middlewares/role.middleware.js`
- `backend/src/middlewares/error.middleware.js`

Validadores:

- `backend/src/validators/index.js`

Utilidades:

- `backend/src/utils/index.js`
- `backend/src/utils/asyncHandler.js`

Modelos:

- `backend/src/models/index.js`
- `backend/src/models/roles.model.js`
- `backend/src/models/usuarios.model.js`
- `backend/src/models/estados.model.js`
- `backend/src/models/espacios.model.js`
- `backend/src/models/recursos.model.js`
- `backend/src/models/recursos-movimientos.model.js`
- `backend/src/models/horarios.model.js`
- `backend/src/models/reservas.model.js`
- `backend/src/models/historial.model.js`

Servicios:

- `backend/src/services/auth.service.js`
- `backend/src/services/roles.service.js`
- `backend/src/services/usuarios.service.js`
- `backend/src/services/estados.service.js`
- `backend/src/services/espacios.service.js`
- `backend/src/services/recursos.service.js`
- `backend/src/services/recursos-movimientos.service.js`
- `backend/src/services/horarios.service.js`
- `backend/src/services/reservas.service.js`
- `backend/src/services/historial.service.js`

Controladores:

- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/roles.controller.js`
- `backend/src/controllers/usuarios.controller.js`
- `backend/src/controllers/estados.controller.js`
- `backend/src/controllers/espacios.controller.js`
- `backend/src/controllers/recursos.controller.js`
- `backend/src/controllers/recursos-movimientos.controller.js`
- `backend/src/controllers/horarios.controller.js`
- `backend/src/controllers/reservas.controller.js`
- `backend/src/controllers/historial.controller.js`

Rutas:

- `backend/src/routes/auth.routes.js`
- `backend/src/routes/roles.routes.js`
- `backend/src/routes/usuarios.routes.js`
- `backend/src/routes/estados.routes.js`
- `backend/src/routes/espacios.routes.js`
- `backend/src/routes/recursos.routes.js`
- `backend/src/routes/horarios.routes.js`
- `backend/src/routes/reservas.routes.js`
- `backend/src/routes/historial.routes.js`
- `backend/src/routes/docente.routes.js`
- `backend/RUTAS_POR_ROL.md`

## 5. Endpoints disponibles

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin-login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Reglas:

- `/api/auth/login` es para usuarios generales: estudiante y docente.
- `/api/auth/admin-login` es exclusivo para administradores.
- `/api/auth/register` no debe permitir crear administradores desde el frontend publico.

### Roles

- `GET /api/roles`
- `GET /api/roles/:id`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`

### Usuarios

- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

### Estados

- `GET /api/estados`
- `GET /api/estados/:id`
- `POST /api/estados`
- `PUT /api/estados/:id`
- `DELETE /api/estados/:id`

### Espacios

- `GET /api/espacios`
- `GET /api/espacios/:id`
- `POST /api/espacios`
- `PUT /api/espacios/:id`
- `DELETE /api/espacios/:id`

### Recursos

- `GET /api/recursos`
- `GET /api/recursos/:id`
- `POST /api/recursos`
- `PUT /api/recursos/:id`
- `DELETE /api/recursos/:id`
- `GET /api/recursos/movimientos`
- `GET /api/recursos/movimientos/:recursoId`
- `POST /api/recursos/movimientos`
  - La consulta de movimientos acepta filtros por `rol_nombre`, `accion` y por recurso para revisar trazabilidad por rol.

### Horarios

- `GET /api/horarios`
- `GET /api/horarios/:id`
- `POST /api/horarios`
- `PUT /api/horarios/:id`
- `DELETE /api/horarios/:id`

### Reservas

- `GET /api/reservas/mis-reservas`
- `GET /api/reservas/disponibilidad`
- `GET /api/reservas`
- `GET /api/reservas/:id`
- `POST /api/reservas`
- `PUT /api/reservas/:id`
- `DELETE /api/reservas/:id`
- `PATCH /api/reservas/:id/aprobar`
- `PATCH /api/reservas/:id/rechazar`
- `PATCH /api/reservas/:id/cancelar`

### Docente

- `GET /api/docente/dashboard`
- `GET /api/docente/reservas`
- `GET /api/docente/historial`
- `GET /api/docente/disponibilidad`

El modulo docente usa rutas propias para no mezclar su experiencia con el panel administrativo ni con los listados de estudiante.

### Estudiante

- `GET /estudiante/dashboard`
- `GET /estudiante/reservas`
- `GET /estudiante/reservas/nueva`
- `GET /estudiante/reservas/editar/:id`
- `GET /estudiante/historial`
- `GET /estudiante/disponibilidad`

Rutas legacy de compatibilidad:

- `GET /mis-reservas`
- `GET /mis-reservas/nueva`
- `GET /mis-reservas/editar/:id`
- `GET /mi-historial`

Estas rutas antiguas redirigen al modulo propio de estudiante para mantener compatibilidad sin mezclar la experiencia con docente.

### Historial

- `GET /api/historial`
- `GET /api/historial/mi-historial`
- `GET /api/historial/reserva/:reservaId`

## 6. Base de datos

Scripts:

- `backend/database/schema.sql`
- `backend/database/seed.sql`
- `backend/database/README_BASE_DATOS.md`

Tablas:

- `roles`
- `usuarios`
- `estados`
- `two_factor_codes`
- `login_attempts`
- `auditoria`
- `password_resets`
- `institutional_code_sequences`
- `institutional_codes`
- `espacios`
- `recursos`
- `historial_recursos`
- `horarios`
- `reservas`
- `reserva_recursos`
- `historial_reservas`

Datos de prueba:

- Administrador: `admin@demo.local` / `Admin123*`
- Docente: `docente@demo.local` / `Docente123*`
- Estudiante: `alumno@demo.local` / `Alumno123*`

## 7. Reglas de negocio implementadas

- Autenticacion con JWT.
- Password cifrada con bcrypt.
- Login general separado del login administrativo.
- Proteccion de rutas con middleware de autenticacion.
- Autorizacion por rol.
- Separacion de reservas admin y reservas propias para docentes/estudiantes.
- Validacion de propiedad para que un usuario normal no consulte reservas ajenas.
- Consulta de disponibilidad por espacio y rango de fechas usando reservas activas.
- Usuarios normales solo pueden cancelar o editar reservas pendientes propias.
- Administradores solo pueden aprobar o rechazar reservas pendientes.
- Validacion de campos obligatorios.
- Validacion de correos duplicados.
- Validacion de codigos duplicados en espacios y recursos.
- Validacion inicial de choques de horario en reservas.
- Registro de historial al crear, actualizar, aprobar, rechazar, cancelar o eliminar reservas.
- Registro de seguimiento de recursos cuando se registran movimientos de asignacion, entrega, devolucion o mantenimiento, con trazabilidad por rol autenticado.

## 8. Relacion con el frontend

El frontend ya tiene formularios para:

- Usuarios
- Roles
- Estados
- Espacios
- Recursos
- Horarios
- Reservas

Para que esos formularios funcionen como CRUD completo, el backend debe conservar y responder correctamente:

- `GET /api/<modulo>` para listados.
- `GET /api/<modulo>/:id` para editar o ver detalle.
- `POST /api/<modulo>` para crear.
- `PUT /api/<modulo>/:id` para actualizar.
- `DELETE /api/<modulo>/:id` para eliminar o desactivar.
- En recursos, tambien existen endpoints de seguimiento para registrar movimientos y consultar trazabilidad. Cada movimiento registra el rol de la sesion autenticada.

Tambien debe devolver errores claros para que el frontend pueda mostrarlos debajo de cada campo.

## 9. Pendientes recomendados del backend

Para acompanar lo que ya se hizo en el frontend, conviene agregar o revisar:

- Respuestas de validacion por campo, por ejemplo `{ campo: "email", mensaje: "El correo ya existe" }`.
- Filtros en listados por query params.
- Busqueda general en listados, por ejemplo `?search=texto`.
- Paginacion para evitar tablas muy grandes.
- Soft delete opcional en lugar de eliminar fisicamente registros importantes.
- Mejorar disponibilidad para considerar mantenimientos de espacios y recursos cuando existan esas tablas.
- Reglas mas estrictas para reservas: fecha inicio menor que fecha fin, espacio disponible y recurso disponible.
- Listados con datos relacionados ya resueltos: nombre de usuario, rol, estado, espacio y horario.

## 10. Ejecucion

Configurar `backend/.env` con:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=sistema_reservas_academico
JWT_SECRET=clave_segura_para_desarrollo
```

Instalar dependencias:

```bash
cd backend
npm install
```

Levantar en desarrollo:

```bash
npm run dev
```

Levantar en modo normal:

```bash
npm start
```

Verificacion:

- `GET http://localhost:3001/api/health`

## 11. Estado actual

El backend ya tiene una base funcional para sostener el CRUD academico. El siguiente trabajo recomendado es fortalecer validaciones, filtros, paginacion y respuestas de error para que el frontend pueda mostrar mensajes mas intuitivos.

