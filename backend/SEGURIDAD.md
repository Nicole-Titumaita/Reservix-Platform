# Seguridad del Backend

Proyecto: `Sistema Academico de Reservas de Espacios y Recursos Tecnologicos`

## Medidas implementadas

- Consultas MySQL parametrizadas con `?` usando `mysql2`.
- Passwords cifradas con `bcryptjs`.
- JWT con expiracion configurada por `JWT_EXPIRES_IN`.
- Validacion obligatoria de `JWT_SECRET` desde `.env`.
- Separacion entre login general y login administrativo.
- Bloqueo de administradores desde el login general.
- Bloqueo de cuentas admin desde registro publico.
- Middleware de autenticacion para rutas protegidas.
- Middleware de autorizacion por rol.
- Rate limiting en login, admin-login y registro.
- Rate limiting general para `/api`.
- Helmet para cabeceras HTTP de seguridad.
- CORS restringido a origenes permitidos.
- Limite de payload JSON y URL encoded.
- Validacion y limpieza basica de entradas.
- Manejo de errores sin exponer detalles internos en produccion.
- Registro persistente de intentos de login en `login_attempts`.
- Auditoria de acciones importantes en `auditoria`.
- Tabla preparada para recuperacion segura de contrasena en `password_resets`.

## Variables obligatorias

Configurar en `backend/.env`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:4201
CORS_ORIGINS=https://reservix.netlify.app,https://*.netlify.app
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=sistema_reservas_academico
JWT_SECRET=cambiar_por_una_clave_larga_y_segura
JWT_EXPIRES_IN=2h
```

En produccion:

- Cambiar `DB_PASSWORD`.
- Cambiar `JWT_SECRET`.
- Usar `NODE_ENV=production`.
- Configurar `CORS_ORIGINS` con el dominio real de Netlify y, si usas previews, el patron `https://*.netlify.app`.
- No usar credenciales semilla.

## Credenciales semilla

Las credenciales del `seed.sql` son solo para pruebas locales:

- `admin@demo.local`
- `docente@demo.local`
- `alumno@demo.local` (estudiante)

Antes de produccion:

- Cambiar contrasenas.
- Desactivar o eliminar usuarios de prueba.
- Crear usuarios reales desde un proceso administrativo controlado.

## Matriz de rutas

### Publicas

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin-login`

### Protegidas con login

- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/reservas/disponibilidad`

### Solo administrador

- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`
- `POST /api/espacios`
- `PUT /api/espacios/:id`
- `DELETE /api/espacios/:id`
- `POST /api/recursos`
- `PUT /api/recursos/:id`
- `DELETE /api/recursos/:id`
- `POST /api/horarios`
- `PUT /api/horarios/:id`
- `DELETE /api/horarios/:id`
- `POST /api/estados`
- `PUT /api/estados/:id`
- `DELETE /api/estados/:id`
- `GET /api/reservas`
- `DELETE /api/reservas/:id`
- `PATCH /api/reservas/:id/aprobar`
- `PATCH /api/reservas/:id/rechazar`
- `GET /api/historial`

### Administrador, docente y estudiante

- `GET /api/espacios`
- `GET /api/espacios/:id`
- `GET /api/horarios`
- `GET /api/horarios/:id`
- `GET /api/estados`
- `GET /api/estados/:id`
- `GET /api/reservas/:id`
- `POST /api/reservas`
- `PUT /api/reservas/:id`
- `PATCH /api/reservas/:id/cancelar`
- `GET /api/historial/reserva/:reservaId`

### Docente y estudiante

- `GET /api/reservas/mis-reservas`
- `GET /api/historial/mi-historial`

## Notas de seguridad pendientes

- Agregar refresh tokens si se necesita sesion larga.
- Implementar HTTPS en produccion.
- Rotar secretos de forma periodica.
- Implementar endpoint administrativo de consulta de auditoria si se requiere visualizarla desde frontend.

## Pruebas de ciberseguridad aplicadas

Estas pruebas se deben ejecutar contra el backend local en `http://localhost:3001/api`.

### Prueba de login correcto

- Endpoint: `POST /api/auth/login`
- Entrada esperada: usuario activo no administrador, por ejemplo `docente@demo.local`.
- Resultado esperado: `success: true`, token JWT y datos del usuario.

### Prueba de contrasena incorrecta

- Endpoint: `POST /api/auth/login`
- Entrada: correo valido con contrasena incorrecta.
- Resultado esperado: `401` con mensaje generico `Credenciales invalidas`.
- Objetivo: no revelar si el correo existe.

### Prueba de correo invalido

- Endpoint: `POST /api/auth/login` o `POST /api/auth/register`
- Entrada: correos como `correo`, `test@`, `test@dominio`.
- Resultado esperado: `400` con mensaje de correo invalido.
- Se permite `@demo.local` solo para pruebas locales.

### Prueba de contrasena debil

- Endpoint: `POST /api/auth/register`
- Entrada: contrasenas como `12345678`, `password`, `Password1`.
- Resultado esperado: `400` indicando reglas faltantes.
- Reglas requeridas: minimo 8 caracteres, mayuscula, minuscula, numero y caracter especial.

### Prueba de SQL Injection en email

- Endpoint: `POST /api/auth/login`
- Entrada: email como `' OR '1'='1` o `admin@demo.local' --`.
- Resultado esperado: `400` por formato invalido o `401` sin autenticar.
- Motivo: las consultas usan parametros `?` de `mysql2`.

### Prueba de SQL Injection en password

- Endpoint: `POST /api/auth/login`
- Entrada: password como `' OR '1'='1`.
- Resultado esperado: `401`.
- Motivo: la contrasena se verifica con `bcryptjs.compare`, no se concatena en SQL.

### Prueba de usuario inactivo

- Endpoint: `POST /api/auth/login`
- Preparacion: marcar usuario con estado `INACTIVO`.
- Resultado esperado: `403` con mensaje `Acceso no autorizado`.

### Prueba de acceso sin token

- Endpoint: cualquier ruta protegida, por ejemplo `GET /api/reservas/mis-reservas`.
- Entrada: sin header `Authorization`.
- Resultado esperado: `401 Token no proporcionado`.

### Prueba de acceso con rol no autorizado

- Endpoint: ruta administrativa, por ejemplo `GET /api/usuarios`.
- Entrada: token de estudiante o docente.
- Resultado esperado: `403 No tienes permisos para realizar esta accion`.

## Mejoras de validacion y ciberseguridad aplicadas

### Validacion de correo

- Frontend y backend validan formato real de correo.
- Se aceptan dominios comunes, institucionales, corporativos y el dominio local `@demo.local`.
- Se rechazan correos sin `@`, sin dominio, con espacios o mal formados.

### Validacion de contrasena segura

- Minimo 8 caracteres.
- Al menos una mayuscula.
- Al menos una minuscula.
- Al menos un numero.
- Al menos un caracter especial.
- El registro muestra un indicador visual de requisitos.

### Confirmacion de contrasena

- El registro solicita `confirm_password`.
- El frontend bloquea el envio si no coincide.
- El backend vuelve a validar coincidencia antes de guardar.

### Validacion de cedula ecuatoriana

- Se valida exactamente 10 digitos.
- Se valida provincia `01` a `24` o `30`.
- Se valida tercer digito menor que 6.
- Se aplica modulo 10 con coeficientes `2,1,2,1,2,1,2,1,2`.
- Se guarda la provincia identificada en `cedula_provincia`.
- Para bases existentes ejecutar:

```sql
SOURCE backend/database/migrations/001_add_auth_security_fields.sql;
```

### Validacion de codigo institucional

- Campo obligatorio.
- Solo acepta letras, numeros, guion medio y guion bajo.
- Longitud permitida: 6 a 30 caracteres.
- Se normaliza en mayusculas.
- Se valida duplicado en MySQL.

### Encriptacion con bcryptjs

- Las contrasenas se cifran con `bcryptjs.hash`.
- El login compara usando `bcryptjs.compare`.
- No se retorna `password_hash` al frontend.

### Proteccion contra SQL Injection

- Las consultas de usuarios usan parametros `?`.
- Se validan duplicados por correo, cedula y codigo institucional con consultas parametrizadas.
- No se concatena entrada del usuario en SQL.

### Proteccion contra XSS

- Se sanitizan textos eliminando etiquetas HTML y caracteres peligrosos.
- Angular muestra valores interpolados, sin `innerHTML` en login o registro.
- Se rechazan entradas con patrones peligrosos como `<script>`.

### Rate limiting

- Registro, login normal, login admin y endpoint 2FA usan `loginLimiter`.
- La API completa usa rate limiting general.

### JWT

- El token se firma con `JWT_SECRET`.
- Tiene expiracion por `JWT_EXPIRES_IN`.
- Las rutas protegidas requieren `Authorization: Bearer <token>`.

### Roles y permisos

- Login normal solo permite `ESTUDIANTE` y `DOCENTE`.
- Login admin solo permite `ADMINISTRADOR`.
- El registro publico bloquea la creacion de administradores.
- Rutas administrativas usan middleware de rol.

### Autenticacion 2FA

- `POST /api/auth/login` y `POST /api/auth/admin-login` ya no entregan JWT directamente.
- Si las credenciales son correctas, el backend genera un OTP de 6 digitos.
- El OTP se guarda hasheado con `bcryptjs` en `two_factor_codes`.
- El OTP expira en 5 minutos.
- `POST /api/auth/verify-2fa` valida el OTP y entrega el JWT.
- `POST /api/auth/resend-2fa` invalida el OTP anterior y genera uno nuevo.
- En desarrollo, cuentas `@demo.local` muestran el OTP en consola del backend.

### Pruebas realizadas

| Prueba | Resultado | Observacion |
| ------ | --------- | ----------- |
| Registro con datos correctos | Pendiente de ejecutar con MySQL local | Requiere aplicar migracion si la base ya existia. |
| Registro con correo invalido | Cubierto por frontend/backend | Debe responder `400`. |
| Registro con contrasena debil | Cubierto por frontend/backend | Debe responder reglas faltantes. |
| Registro con contrasenas que no coinciden | Cubierto por frontend/backend | Debe bloquear envio o responder `400`. |
| Registro con cedula invalida | Cubierto por frontend/backend | Mensaje: `La cedula ingresada no es valida`. |
| Registro con cedula valida | Validado en algoritmo local | Semillas verificadas con modulo 10. |
| Registro con codigo institucional invalido | Cubierto por frontend/backend | Solo letras, numeros, `-` o `_`. |
| Registro con correo duplicado | Cubierto por backend | Respuesta `409`. |
| Registro con cedula duplicada | Cubierto por backend | Respuesta `409`. |
| Login correcto | Se mantiene flujo existente | Usa bcrypt y JWT. |
| Login con contrasena incorrecta | Cubierto por backend | Mensaje generico `Credenciales invalidas`. |
| Login con usuario inactivo | Cubierto por backend | Respuesta `403`. |
| Login admin con usuario admin | Se mantiene endpoint separado | `POST /api/auth/admin-login`. |
| Login admin con usuario normal | Cubierto por backend | Respuesta `403`. |
| SQL Injection en correo | Cubierto por validacion y parametros | No concatena SQL. |
| SQL Injection en contrasena | Cubierto por bcrypt | No consulta password en SQL. |
| SQL Injection en cedula | Cubierto por formato numerico estricto | Solo 10 digitos. |
| XSS en nombres | Cubierto por sanitizacion y patron | Rechaza o limpia etiquetas. |
| Acceso sin token | Cubierto por middleware JWT | Respuesta `401`. |
| Acceso con rol no autorizado | Cubierto por middleware de rol | Respuesta `403`. |

### Recomendaciones antes de produccion

- Ejecutar migraciones en un respaldo de la base antes de produccion.
- Cambiar credenciales semilla y contrasenas de prueba.
- Reemplazar `@demo.local` por dominios reales o dejarlo solo en ambiente local.
- Configurar SMTP real para envio de codigos OTP.
- Activar HTTPS.
- Rotar `JWT_SECRET` y credenciales de base de datos.

## Autenticacion 2FA real con OTP por correo

### Flujo aplicado

1. El usuario envia correo y contrasena a `POST /api/auth/login` o `POST /api/auth/admin-login`.
2. El backend valida credenciales, estado activo y rol permitido.
3. Si todo es correcto, genera un OTP de 6 digitos.
4. Invalida cualquier OTP activo previo del usuario.
5. Guarda el OTP hasheado con `bcryptjs` en `two_factor_codes`.
6. Define expiracion de 5 minutos.
7. Envia el OTP por correo usando Nodemailer.
8. Si el correo termina en `@demo.local`, no envia correo real y muestra el OTP en consola solo fuera de produccion.
9. Si no hay SMTP configurado y `NODE_ENV` no es `production`, muestra el OTP en consola con la etiqueta `[2FA DEV SIN SMTP]`.
10. El frontend muestra la segunda pantalla para ingresar el codigo.
11. `POST /api/auth/verify-2fa` valida el OTP, lo marca como usado y entrega el JWT.
12. `POST /api/auth/resend-2fa` genera un nuevo OTP y vuelve a enviarlo.

### Flujo del login con OTP

```text
Usuario -> login/admin-login con correo y contrasena
Backend -> valida credenciales, estado y rol
Backend -> genera OTP de 6 digitos
Backend -> guarda hash bcrypt del OTP
Backend -> envia OTP por correo o consola si es @demo.local
Frontend -> muestra pantalla para ingresar OTP
Usuario -> envia OTP a verify-2fa
Backend -> valida OTP activo, no usado y no vencido
Backend -> marca OTP como usado
Backend -> entrega JWT
Frontend -> guarda sesion y entra al dashboard
```

### Tabla `two_factor_codes`

- Es la tabla oficial para almacenar codigos OTP del modulo 2FA.
- Los campos antiguos de 2FA en `usuarios` no se usan para guardar codigos temporales.
- `usuario_id`: usuario asociado.
- `purpose`: uso del codigo, actualmente `LOGIN`.
- `code_hash`: hash bcrypt del OTP.
- `expires_at`: fecha/hora de expiracion.
- `used_at`: fecha/hora de uso, `NULL` si aun no se uso.
- `created_at`: auditoria basica de creacion.

### Expiracion y uso del OTP

- Cada OTP expira 5 minutos despues de crearse.
- Al reenviar codigo, los OTP activos anteriores se invalidan marcando `used_at`.
- Al validar correctamente, el OTP se marca como usado.
- Un OTP usado no puede reutilizarse.
- Un OTP vencido no entrega JWT.

### Hash del OTP

- El OTP nunca se guarda en texto plano.
- Se guarda en `two_factor_codes.code_hash` usando `bcryptjs`.
- La comparacion se hace con `bcrypt.compare`.
- El OTP plano solo existe temporalmente para enviarlo por correo o imprimirlo en consola en ambiente local con `@demo.local`.

### Variables SMTP

Configurar en `backend/.env` para correos reales:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=correo@gmail.com
SMTP_PASS=contrasena_de_aplicacion
SMTP_FROM="Sistema Academico <correo@gmail.com>"
```

Para pruebas con `admin@demo.local`, `docente@demo.local` o `alumno@demo.local` (estudiante), revisar la consola del backend. Si se usa un correo real pero no hay SMTP configurado en desarrollo, tambien se imprime en consola. En produccion no se imprime el OTP y SMTP debe estar configurado.

### Gmail SMTP

Configuracion recomendada con STARTTLS:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

Configuracion alternativa con SSL directo:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

Para Gmail se debe usar una contrasena de aplicacion, no la contrasena normal de la cuenta.

Pasos:

1. Activar verificacion en dos pasos en la cuenta de Google.
2. Entrar a `Cuenta de Google > Seguridad`.
3. Crear una `Contrasena de aplicacion`.
4. Guardarla en `SMTP_PASS`.
5. Reiniciar el backend.
6. Confirmar en consola: `SMTP verificado correctamente`.

Errores frecuentes:

- `Invalid login` o `EAUTH`: usuario SMTP o contrasena de aplicacion incorrectos.
- `ETIMEDOUT`: red, firewall o puerto bloqueado.
- `Greeting never received`: usar puerto/SSL incorrecto.
- Correo no recibido: revisar spam, promociones o limites diarios de Gmail.

### Recomendaciones SMTP para produccion

- Configurar un proveedor SMTP real.
- Usar credenciales SMTP en variables de entorno, nunca en codigo.
- Usar `SMTP_SECURE=true` si el proveedor exige TLS directo.
- Restringir `CORS_ORIGINS` al dominio real del frontend.
- No usar correos `@demo.local` en produccion.
- No imprimir OTP en consola en produccion.
- Rotar credenciales SMTP si se filtran.
- Monitorear intentos fallidos y considerar bloqueo temporal por usuario.

### Endpoints 2FA

- `POST /api/auth/verify-2fa`
- `POST /api/auth/resend-2fa`

### Validacion antes de entregar JWT

- El JWT solo se firma despues de validar `verify-2fa`.
- `login` y `admin-login` solo devuelven `requires_2fa`, `user_id`, `two_factor_token`, expiracion y canal de entrega.
- Si el OTP es incorrecto, usado, vencido o inexistente, no se entrega JWT.
- Si el rol no corresponde, no se genera OTP.

### Migracion requerida

```sql
SOURCE backend/database/migrations/002_create_two_factor_codes.sql;
```

### Pruebas realizadas y resultados

| Prueba | Resultado | Observacion |
| ------ | --------- | ----------- |
| Login normal con usuario `@demo.local` | Aprobado | `alumno@demo.local` devuelve `requires_2fa: true`. |
| No entregar JWT antes del OTP | Aprobado | La respuesta inicial no contiene `token` ni datos de sesion. |
| OTP en consola backend | Aprobado | En desarrollo se imprime `[2FA DEMO] OTP para ...`. |
| OTP guardado hasheado | Aprobado | `code_hash` inicia con `$2` y no coincide con el OTP plano. |
| `verify-2fa` con OTP correcto | Aprobado | Entrega JWT y datos de usuario. |
| OTP incorrecto | Aprobado | Se rechaza y no entrega JWT. |
| OTP usado | Aprobado | No puede reutilizarse. |
| OTP vencido | Aprobado | Se rechaza si `expires_at` esta en pasado. |
| `resend-2fa` | Aprobado | Invalida codigo anterior y crea uno nuevo. |
| Login admin con 2FA | Aprobado | `admin@demo.local` genera OTP. |
| Usuario normal en login admin | Aprobado | `alumno@demo.local` es rechazado en `admin-login`. |
| Pantalla OTP frontend | Aprobado | Login normal y admin muestran segunda pantalla para codigo. |

## Fase 2 de seguridad operativa

### Tabla `login_attempts`

Registra intentos de inicio de sesion exitosos y fallidos.

Campos principales:

- `usuario_id`
- `email`
- `endpoint`
- `ip`
- `user_agent`
- `success`
- `failure_reason`
- `created_at`

Usos:

- Analizar intentos fallidos.
- Detectar fuerza bruta.
- Auditar accesos.
- Bloquear temporalmente login por email/IP si hay demasiados fallos recientes.

### Tabla `auditoria`

Registra acciones importantes del sistema.

Campos principales:

- `usuario_id`
- `accion`
- `entidad`
- `entidad_id`
- `detalle`
- `ip`
- `user_agent`
- `created_at`

Acciones registradas actualmente:

- `LOGIN_2FA_VERIFICADO`
- `USUARIO_CREADO`
- `USUARIO_ACTUALIZADO`
- `USUARIO_ELIMINADO`
- `ROL_CREADO`
- `ROL_ACTUALIZADO`
- `ROL_ELIMINADO`
- `ESTADO_CREADO`
- `ESTADO_ACTUALIZADO`
- `ESTADO_ELIMINADO`
- `ESPACIO_CREADO`
- `ESPACIO_ACTUALIZADO`
- `ESPACIO_ELIMINADO`
- `RECURSO_CREADO`
- `RECURSO_ACTUALIZADO`
- `RECURSO_ELIMINADO`
- `RESERVA_CREADA`
- `RESERVA_ACTUALIZADA`
- `RESERVA_ELIMINADA`
- `RESERVA_APROBADA`
- `RESERVA_RECHAZADA`
- `RESERVA_CANCELADA`

### Tabla `password_resets`

Queda preparada para recuperacion segura de contrasena.

Campos principales:

- `usuario_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

Reglas esperadas para el flujo futuro:

- Guardar token hasheado.
- Expirar token.
- Marcar token como usado.
- No guardar tokens en texto plano.

### Contrasena temporal segura

La creacion administrativa de usuarios ya no usa la contrasena fija `Cambiar123*` como fallback.

Si no se envia una contrasena, se genera una contrasena temporal aleatoria y se guarda hasheada. Para produccion se recomienda implementar un flujo de invitacion o recuperacion de contrasena para entregar credenciales de forma segura.

### Migracion Fase 2

```sql
SOURCE backend/database/migrations/003_operational_security_phase2.sql;
```

## Fase 3 de alta prioridad: seguridad, rendimiento y mantenimiento

### Limpieza de 2FA heredado

La tabla oficial de OTP es `two_factor_codes`.

La migracion `004_high_priority_security_performance.sql` elimina, si existen, columnas heredadas de `usuarios`:

- `two_factor_temp_code`
- `two_factor_expires_at`

Estas columnas no deben usarse para nuevos codigos ni para validar login.

### Indices agregados

Reservas:

- `idx_reservas_disponibilidad (espacio_id, estado_id, fecha_inicio, fecha_fin)`
- `idx_reservas_usuario_fecha (usuario_id, fecha_inicio)`

Login attempts:

- `idx_login_attempts_email_fecha (email, created_at)`
- `idx_login_attempts_ip_fecha (ip, created_at)`

Auditoria:

- `idx_auditoria_usuario_fecha (usuario_id, created_at)`
- `idx_auditoria_accion_fecha (accion, created_at)`

### Bloqueo temporal con `login_attempts`

El login normal y el login administrativo consultan intentos fallidos recientes antes de validar credenciales.

Reglas actuales:

- 5 intentos fallidos.
- Ventana de 15 minutos.
- Bloqueo por coincidencia de correo o IP.
- Registro de bloqueo con `failure_reason = 'BLOQUEO_TEMPORAL'`.
- Respuesta generica al usuario: `Demasiados intentos. Intenta nuevamente en unos minutos.`

No se informa si el correo existe, si la contrasena fallo o si el rol era incorrecto.

### Paginacion opcional

Los listados grandes aceptan `page` y `limit`:

- `GET /api/usuarios?page=1&limit=20`
- `GET /api/reservas?page=1&limit=20`
- `GET /api/reservas/mis-reservas?page=1&limit=20`
- `GET /api/recursos?page=1&limit=20`
- `GET /api/espacios?page=1&limit=20`

Si no se envian parametros, se conserva la respuesta anterior para no romper el frontend.

### Auditoria ampliada

Se registra auditoria en:

- CRUD de usuarios.
- CRUD de roles.
- CRUD de estados.
- CRUD de espacios.
- CRUD de recursos.
- Creacion, actualizacion, eliminacion y cambios de estado de reservas.

La auditoria no bloquea la operacion principal si falla el registro; el error se escribe en consola de forma controlada.

### Migracion Fase 3

```sql
SOURCE backend/database/migrations/004_high_priority_security_performance.sql;
```

La migracion es segura para ejecuciones repetidas porque valida columnas e indices antes de aplicar cambios.

## Recuperacion de contrasena

El flujo de `Olvide mi contrasena` usa la tabla `password_resets`.

### Endpoints

- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password/:token`
- `POST /api/auth/reset-password`

### Flujo

1. El usuario ingresa su correo.
2. Si existe una cuenta asociada, el backend genera un token aleatorio de 32 bytes.
3. El token se guarda solo como `SHA-256` en `password_resets.token_hash`.
4. El enlace se envia por correo con vigencia de 15 minutos.
5. Si SMTP no esta configurado y el entorno no es produccion, el enlace se muestra solo en consola del backend.
6. El usuario abre el enlace, valida el token y define una nueva contrasena.
7. La nueva contrasena se guarda con `bcryptjs`.
8. El token queda marcado como usado y no puede reutilizarse.

### Campos usados en `password_resets`

- `usuario_id`
- `token_hash`
- `expires_at`
- `used_at`
- `ip`
- `user_agent`
- `created_at`

### Seguridad aplicada

- No se revela si el correo existe o no.
- No se guarda el token en texto plano.
- El enlace expira en 15 minutos por configuracion.
- Se invalida cualquier token anterior del mismo usuario antes de generar uno nuevo.
- Se registra auditoria en solicitudes, enlaces invalidos, enlaces expirados y cambios exitosos.
- Se usa rate limiting especifico para recuperacion.

### Pruebas recomendadas

- Solicitud con correo valido.
- Solicitud con correo inexistente.
- Acceso al enlace con token valido.
- Acceso al enlace con token vencido.
- Reutilizacion de token.
- Cambio de contrasena correcto.
- Inicio de sesion con la nueva contrasena.

## Pruebas Automatizadas

La suite automatizada del backend usa Jest y Supertest.

Archivo principal:

```text
backend/TESTING.md
```

La suite cubre:

- validadores
- auth
- recuperacion de contrasena
- 2FA
- codigo institucional
- bloqueo por intentos
- rutas base

Cobertura observada en la fase 3:

- Backend: 45.39% statements, 31.02% branches, 29.33% functions, 45.54% lines
