# Documentacion del Frontend

Proyecto: `Sistema Academico de Reservas de Espacios y Recursos Tecnologicos`

Este documento deja alineado lo que se ha construido en el frontend Angular y lo que todavia debe conectarse o completarse para que el sistema se comporte como un CRUD normal, claro e intuitivo.

## 1. Objetivo del frontend

El frontend es la capa cliente de la arquitectura multicapa. Sus responsabilidades son:

- Mostrar la interfaz del usuario.
- Consumir la API del backend Node.js + Express.
- Gestionar rutas y layouts.
- Proteger rutas segun autenticacion y rol.
- Validar formularios desde el cliente.
- Mantener separados los archivos `.ts`, `.html` y `.scss`.

## 2. Tecnologias usadas

- Angular
- TypeScript
- Reactive Forms
- Angular Router
- HttpClient
- Tailwind CSS
- Lucide Icons

## 3. Estructura general

Archivos principales:

- `frontend/angular.json`
- `frontend/package.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/tsconfig.json`
- `frontend/tsconfig.app.json`
- `frontend/src/styles.scss`
- `frontend/src/environments/environment.ts`

Carpetas principales:

- `frontend/src/app/core`
- `frontend/src/app/layouts`
- `frontend/src/app/features`
- `frontend/src/app/shared`

## 4. Core

La carpeta `src/app/core` contiene modelos, servicios, guards e interceptores.

Servicios creados:

- `AuthService`
- `RolesService`
- `UsuariosService`
- `EspaciosService`
- `RecursosService`
- Seguimiento de recursos mediante el modulo `recursos-seguimiento`
- `HorariosService`
- `EstadosService`
- `ReservasService`
- `HistorialService`

Seguridad:

- `auth.interceptor.ts`: envia el token JWT en peticiones HTTP.
- `auth.guard.ts`: protege rutas privadas.
- `role.guard.ts`: controla acceso por rol.

Modelos:

- `frontend/src/app/core/models/index.ts`

## 5. Layouts

Layouts implementados:

- `frontend/src/app/layouts/auth-layout`
- `frontend/src/app/layouts/main-layout`

Cada layout conserva archivos separados:

- `.ts`
- `.html`
- `.scss`

Cambios recientes del layout principal:

- Sidebar con scroll interno.
- Sidebar expandible y colapsable.
- Al colapsar, se muestran solo iconos.
- Boton de salir alineado dentro del layout.
- Tamano visual reducido para que el dashboard no se vea demasiado grande.
- Ajustes responsive para pantallas pequenas.

## 6. Modulos funcionales

Modulos creados dentro de `src/app/features`:

- `auth`
- `dashboard`
- `usuarios`
- `roles`
- `espacios`
- `recursos`
- `horarios`
- `estados`
- `reservas`
- `historial`
- `recursos/recursos-seguimiento`

Cada componente respeta la separacion:

- `.ts` para logica.
- `.html` para plantilla.
- `.scss` para estilos locales.

## 7. Autenticacion

Pantallas creadas:

- Login general: `/auth/login`
- Login administrativo: `/auth/admin-login`
- Registro publico: `/auth/register`
- Recuperar contrasena: `/auth/forgot-password`

Reglas actuales:

- El login general consume `POST /api/auth/login`.
- El login administrativo consume `POST /api/auth/admin-login`.
- El registro publico no debe permitir registrar administradores.
- El usuario se redirige segun su rol despues del login.

Flujos separados:

- Administrador: gestiona usuarios, roles, estados, espacios, recursos, horarios, reservas e historial global.
- Docente o estudiante: crea solicitudes, consulta disponibilidad, revisa sus reservas y ve seguimiento propio.

Usuarios de prueba definidos desde seed SQL:

- Administrador: `admin@demo.local` / `Admin123*`
- Docente: `docente@demo.local` / `Docente123*`
- Estudiante: `alumno@demo.local` / `Alumno123*`

## 8. Formularios CRUD

Se normalizaron los formularios principales para que sean mas intuitivos.

Formularios ajustados:

- Usuarios
- Roles
- Estados
- Espacios
- Recursos
- Horarios
- Reservas

Mejoras aplicadas:

- Labels visibles en todos los campos.
- Campos obligatorios marcados con `*`.
- Placeholders con ejemplos reales.
- Textos de ayuda cortos.
- Botones `Cancelar` y `Guardar` alineados.
- Grilla responsive con dos columnas en escritorio y una columna en movil.
- Tamano visual mas compacto.
- Estilos reutilizables desde `frontend/src/styles.scss`.
- Modo crear y editar usando el mismo componente de formulario.
- Carga de datos con `GET /api/<modulo>/:id`.
- Actualizacion de datos con `PUT /api/<modulo>/:id`.
- Botones `Editar` conectados desde los listados.

Clases globales agregadas:

- `crud-page`
- `crud-header`
- `crud-eyebrow`
- `crud-title`
- `crud-description`
- `form-grid`
- `form-field`
- `form-field-full`
- `form-label`
- `form-required`
- `form-control`
- `form-help`
- `form-check`
- `form-actions`

## 9. Rutas principales

Rutas configuradas en:

- `frontend/src/app/app.routes.ts`

Rutas principales:

- `/auth/login`
- `/auth/admin-login`
- `/auth/register`
- `/auth/forgot-password`
- `/dashboard`
- `/usuarios`
- `/usuarios/nuevo`
- `/usuarios/editar/:id`
- `/roles`
- `/roles/nuevo`
- `/roles/editar/:id`
- `/espacios`
- `/espacios/nuevo`
- `/espacios/editar/:id`
- `/recursos`
- `/recursos/nuevo`
- `/recursos/editar/:id`
- `/recursos/seguimiento`
- `/horarios`
- `/horarios/nuevo`
- `/horarios/editar/:id`
- `/estados`
- `/estados/nuevo`
- `/estados/editar/:id`
- `/reservas`
- `/reservas/nueva`
- `/reservas/editar/:id`
- `/reservas/disponibilidad`
- `/mis-reservas`
- `/mis-reservas/nueva`
- `/mis-reservas/editar/:id`
- `/mi-historial`
- `/historial`

## 10. Estado actual

El frontend ya tiene:

- Arquitectura por modulos.
- Layout de autenticacion.
- Layout principal con sidebar.
- Servicios para consumir la API.
- Guards e interceptor JWT.
- Formularios reactivos.
- CRUD visual inicial para los modulos principales.
- Edicion funcional para usuarios, roles, estados, espacios, recursos, horarios y reservas.
- Seguimiento de recursos con registro de movimientos y trazabilidad de estado, mostrando el rol autenticado que genero cada movimiento.
- La vista de seguimiento permite filtrar por rol, por recurso y por accion para revisar la trazabilidad de cada usuario.
- La vista tambien muestra un resumen por rol con el total de movimientos visibles.
- Menu separado por rol: los usuarios no administradores no ven opciones exclusivas del admin.
- Reservas personales para docentes y estudiantes usando `GET /api/reservas/mis-reservas`.
- Seguimiento personal usando `GET /api/historial/mi-historial`.
- Apartado `Mi historial` para usuarios normales, ligado a la tabla `historial_reservas`.
- Consulta real de disponibilidad usando `GET /api/reservas/disponibilidad`.
- Estilos globales con Tailwind.
- Compilacion validada con `npm run build`.

## 11. Ejecucion

Puerto actual del frontend:

- `4201`

Comandos:

```bash
cd frontend
npm install
npm start
```

Tambien funciona:

```bash
npm run dev
```

## 12. Pendientes del frontend

Para completar el comportamiento CRUD normal faltan:

- Boton `Ver detalle` si se desea consultar sin editar.
- Confirmacion visual antes de eliminar.
- Mensajes de error debajo de cada campo.
- Alertas amigables de exito y error.
- Filtros y busqueda en listados.
- Estados vacios cuando no existan registros.
- Pantallas de detalle si se requiere consultar un registro sin editarlo.

## 13. Pendientes que dependen del backend

El frontend ya muestra campos para crear registros, pero para que el CRUD quede completo el backend debe garantizar:

- `GET /api/<modulo>/:id` para cargar datos al editar o ver detalle.
- `PUT /api/<modulo>/:id` para actualizar registros.
- `DELETE /api/<modulo>/:id` para eliminar o desactivar registros.
- Respuestas de error claras por campo cuando falle una validacion.
- Validaciones de negocio para reservas, especialmente choques de horario.
- Listados con datos relacionados, por ejemplo nombre de rol, estado, espacio y usuario.
- Opcionalmente filtros por query params, por ejemplo `?search=`, `?estado_id=` o `?categoria=`.

## 14. Regla de mantenimiento

Cuando se agregue un nuevo componente, mantener siempre:

- Un archivo `.ts`.
- Un archivo `.html`.
- Un archivo `.scss`.

Evitar poner HTML o estilos largos dentro del TypeScript.
