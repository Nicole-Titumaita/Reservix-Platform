# Sistema Academico de Reservas de Espacios y Recursos Tecnologicos

Proyecto academico construido con arquitectura multicapa cliente-servidor.

- Frontend: Angular
- Backend: Node.js + Express.js
- Base de datos: MySQL

## Estructura General

```text
PROYECTO CRUD/
├─ README.md
├─ frontend/
│  ├─ package.json
│  ├─ angular.json
│  └─ src/
│     ├─ app/
│     ├─ environments/
│     └─ styles.scss
├─ backend/
│  ├─ package.json
│  ├─ .env
│  ├─ SEGURIDAD.md
│  ├─ database/
│  │  ├─ schema.sql
│  │  ├─ seed.sql
│  │  └─ migrations/
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/
│     ├─ controllers/
│     ├─ middlewares/
│     ├─ models/
│     ├─ routes/
│     ├─ services/
│     ├─ utils/
│     └─ validators/
└─ database/
   ├─ schema.sql
   └─ seed.sql
```

## Ejecucion del Proyecto

### Variables de entorno

Los archivos `.env` reales no se suben al repositorio. El proyecto usa estas reglas:

- `backend/.env` y `frontend/.env` quedan ignorados por git.
- `backend/.env.example` se usa como plantilla para crear el `.env` local.
- Si necesitas variables en frontend, usa `frontend/src/environments/environment.ts` o una plantilla propia si luego la agregas.

Antes de ejecutar, copia la plantilla de backend y completa tus valores locales:

```bash
copy backend\.env.example backend\.env
```

Si trabajas en Windows PowerShell, tambien puedes crear el archivo manualmente y editarlo con tus credenciales locales.

El frontend no necesita archivo `.env`; usa `frontend/src/environments/environment.ts` y, en local, apunta automaticamente a `http://localhost:3001/api`.

Si quieres verificar que todo está excluido antes de subir cambios, evita usar `git add .` a ciegas y revisa primero con `git status`.

### Backend

```bash
cd backend
npm install
npm run dev
```

El backend queda disponible en:

```text
http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm start
```

El frontend queda disponible en:

```text
http://localhost:4201
```

## Base de Datos

Base configurada:

```text
sistema_reservas_academico
```

Scripts principales:

- `backend/database/schema.sql`
- `backend/database/seed.sql`
- `backend/database/migrations/001_add_auth_security_fields.sql`
- `backend/database/migrations/002_create_two_factor_codes.sql`
- `backend/database/migrations/003_operational_security_phase2.sql`
- `backend/database/migrations/004_high_priority_security_performance.sql`
- `backend/database/migrations/005_password_reset_flow.sql`
- `backend/database/migrations/006_institutional_codes.sql`
- `backend/database/migrations/007_create_historial_recursos.sql`

## Autenticacion con 2FA

El sistema usa autenticacion de doble factor con codigo OTP.

Flujo:

1. El usuario ingresa correo y contrasena.
2. El backend valida credenciales, estado y rol.
3. Si son correctas, genera un OTP de 6 digitos.
4. El OTP se guarda hasheado en MySQL.
5. El OTP expira en 5 minutos.
6. El frontend muestra una pantalla para ingresar el codigo.
7. Solo despues de validar el OTP se entrega el JWT.

## Seguimiento de recursos

Ademas del CRUD de recursos, el sistema incluye un modulo de seguimiento para registrar movimientos como:

- asignacion
- entrega
- devolucion
- revision
- mantenimiento
- baja
- incidencia

Ese seguimiento queda almacenado en `historial_recursos` y se consulta desde el frontend en `/recursos/seguimiento`.
Cada movimiento registra tambien el rol del actor autenticado, para dejar trazabilidad por `ADMINISTRADOR`, `DOCENTE` o `ESTUDIANTE` segun la sesion activa.
Desde la pantalla de seguimiento tambien se puede filtrar por rol o por recurso para revisar la trazabilidad por cada tipo de usuario.

## Probar Login con 2FA usando Usuarios Demo

Usuarios de prueba:

```text
admin@demo.local
docente@demo.local
alumno@demo.local
```

Para cuentas `@demo.local`, el sistema no envia correo real. En desarrollo, el OTP aparece en la consola donde esta corriendo el backend.

Si usas un correo real pero todavia no configuraste SMTP, en desarrollo tambien se mostrara el OTP en consola con la etiqueta `[2FA DEV SIN SMTP]`. En produccion esto no ocurre: SMTP debe estar configurado.

Ejemplo:

```text
[2FA DEMO] OTP para alumno@demo.local: 123456
```

Pasos para probar:

1. Inicia el backend con `npm run dev`.
2. Inicia el frontend con `npm start`.
3. Entra al login normal con `alumno@demo.local` o `docente@demo.local`.
4. Revisa la consola del backend y copia el OTP mostrado.
5. Ingresa el OTP en la segunda pantalla del frontend.
6. Si el codigo es correcto, el sistema entrega JWT y entra al dashboard.

Para administrador:

1. Entra por el login administrativo.
2. Usa `admin@demo.local`.
3. Revisa la consola del backend.
4. Ingresa el OTP.
5. El sistema permite el acceso solo si el usuario tiene rol `ADMINISTRADOR`.

## Reenvio de OTP

La pantalla de 2FA permite reenviar el codigo.

Cuando se reenvia:

- El OTP anterior se invalida.
- Se genera un OTP nuevo.
- El nuevo OTP vuelve a expirar en 5 minutos.
- Para `@demo.local`, el nuevo codigo se imprime en consola del backend.

## SMTP para Produccion

Para enviar correos reales se deben configurar estas variables en `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=correo@gmail.com
SMTP_PASS=contrasena_de_aplicacion
SMTP_FROM="Sistema Academico <correo@gmail.com>"
```

Tambien se puede usar SSL directo:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=correo@gmail.com
SMTP_PASS=contrasena_de_aplicacion
SMTP_FROM="Sistema Academico <correo@gmail.com>"
```

### Crear contrasena de aplicacion en Google

1. Activar verificacion en dos pasos en la cuenta de Google.
2. Entrar a `Cuenta de Google > Seguridad`.
3. Buscar `Contrasenas de aplicaciones`.
4. Crear una contrasena para una app tipo `Correo`.
5. Copiar la clave generada en `SMTP_PASS`.
6. No usar la contrasena normal de Gmail.

### Probar envio real de OTP

1. Configura las variables SMTP en `backend/.env`.
2. Reinicia el backend con `npm run dev`.
3. Verifica en consola que aparezca `SMTP verificado correctamente`.
4. Inicia sesion desde el frontend con un usuario cuyo correo sea real.
5. Revisa la bandeja de entrada y spam/promociones.
6. Ingresa el OTP recibido en la segunda pantalla.

### Errores SMTP frecuentes

- `Invalid login`: la contrasena de aplicacion es incorrecta o no esta habilitada.
- `EAUTH`: Gmail rechazo la autenticacion SMTP.
- `ETIMEDOUT`: red, firewall o puerto bloqueado.
- `Greeting never received`: configuracion incorrecta de puerto/SSL.
- No llega el correo: revisar spam, promociones o limites de Gmail.

Recomendaciones:

- No usar cuentas `@demo.local` en produccion.
- No imprimir OTP en consola en produccion.
- Usar un proveedor SMTP real.
- Mantener credenciales SMTP fuera del codigo.
- Activar HTTPS.
- Usar un `JWT_SECRET` largo y seguro.

## Seguridad

La documentacion detallada de seguridad esta en:

```text
backend/SEGURIDAD.md
```

Incluye:

- JWT.
- Roles y permisos.
- Rate limiting.
- Helmet.
- CORS.
- Validaciones.
- Proteccion contra SQL Injection.
- Proteccion contra XSS.
- 2FA con OTP por correo.
- Registro de intentos de login con `login_attempts`.
- Auditoria de acciones importantes con `auditoria`.
- Preparacion de recuperacion de contrasena con `password_resets`.
- Pruebas realizadas.

## Migraciones De Seguridad Operativa

La Fase 2 de seguridad agrega:

- `login_attempts`: intentos de inicio de sesion.
- `auditoria`: acciones importantes del sistema.
- `password_resets`: base para recuperacion segura de contrasena.

Migracion:

```sql
SOURCE backend/database/migrations/003_operational_security_phase2.sql;
```

La tabla oficial para codigos OTP es:

```text
two_factor_codes
```

Los campos antiguos de OTP temporal en `usuarios` no deben usarse para nuevos codigos.

## Migracion De Alta Prioridad

La Fase 3 agrega mejoras de seguridad, rendimiento y mantenimiento:

- Limpia columnas antiguas de 2FA en `usuarios` si todavia existen.
- Agrega indices compuestos para disponibilidad de reservas.
- Agrega indices para busquedas por email/IP/fecha en `login_attempts`.
- Agrega indices para consultas por usuario/accion/fecha en `auditoria`.
- Mantiene `two_factor_codes` como tabla oficial de OTP.

Migracion:

```sql
SOURCE backend/database/migrations/004_high_priority_security_performance.sql;
```

Si no tienes `mysql` en el PATH, puedes abrir MySQL Workbench, seleccionar la base `sistema_reservas_academico` y ejecutar el contenido del archivo:

```text
backend/database/migrations/004_high_priority_security_performance.sql
```

## Paginacion Opcional

Los listados grandes aceptan paginacion sin romper el comportamiento anterior:

```text
GET /api/usuarios?page=1&limit=20
GET /api/reservas?page=1&limit=20
GET /api/reservas/mis-reservas?page=1&limit=20
GET /api/recursos?page=1&limit=20
GET /api/espacios?page=1&limit=20
```

Sin `page` y `limit`, los endpoints siguen devolviendo el arreglo normal que ya consume el frontend.

Con paginacion, la respuesta incluye:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

## Bloqueo Temporal De Login

El backend usa `login_attempts` para bloquear temporalmente un login despues de varios intentos fallidos recientes por correo o IP.

- Ventana actual: 15 minutos.
- Limite actual: 5 intentos fallidos.
- El bloqueo registra `BLOQUEO_TEMPORAL`.
- El usuario recibe un mensaje generico para no revelar informacion sensible.

## Auditoria Ampliada

La auditoria registra acciones administrativas y de reservas:

- Usuarios: crear, actualizar, eliminar.
- Roles: crear, actualizar, eliminar.
- Estados: crear, actualizar, eliminar.
- Espacios: crear, actualizar, eliminar.
- Recursos: crear, actualizar, eliminar.
- Reservas: crear, actualizar, eliminar, aprobar, rechazar, cancelar.

## Recuperacion De Contrasena

El sistema incluye un flujo seguro de `Olvide mi contrasena`.

Endpoints:

```text
POST /api/auth/forgot-password
GET /api/auth/reset-password/:token
POST /api/auth/reset-password
```

Como probarlo:

1. Abre la pantalla `Olvide mi contrasena`.
2. Ingresa un correo valido registrado.
3. Si usas SMTP real, revisa el correo recibido.
4. Si el entorno de desarrollo no tiene SMTP, el enlace aparece en la consola del backend.
5. Abre el enlace y define una nueva contrasena.
6. Inicia sesion con la nueva contrasena.

Seguridad aplicada:

- El token se guarda solo con hash SHA-256.
- El enlace expira en 15 minutos.
- No se revela si el correo existe o no.
- Los tokens anteriores del mismo usuario se invalidan al pedir uno nuevo.
- La nueva contrasena se guarda con bcrypt.

## Pruebas Automatizadas

La estructura de pruebas del proyecto está documentada en:

- `backend/TESTING.md`
- `frontend/TESTING.md`

Cobertura observada en la fase 3:

- Backend: 45.39% statements, 31.02% branches, 29.33% functions, 45.54% lines
- Frontend: 51.21% statements, 29.18% branches, 38.46% functions, 51.16% lines

Comandos principales:

```bash
cd backend
npm test
npm run test:coverage

cd frontend
npm test
npm run test:coverage
```
